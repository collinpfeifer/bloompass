import {
  Anchor,
  Button,
  Checkbox,
  Group,
  Paper,
  Stack,
  TextInput,
  Text,
  PasswordInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';
import { z } from 'zod';
// import { PasswordStrength } from '../components/passwordstrength';
import { signUp } from '../models/user.server';
import { createSession, getUser } from '../session.server';
import { useForm } from '@mantine/form';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const params = new URLSearchParams(request.url.split('?')[1]);
  const redirectTo = params.get('redirectTo');
  const user = await getUser(request);
  if (user)
    return redirect(`/feed${redirectTo ? `?redirectTo=${redirectTo}` : ''}`);
  else return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = Object.fromEntries(await request.formData());

  const userSignUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(50),
    redirectTo: z.string().optional(),
  });

  try {
    const result = userSignUpSchema.safeParse(formData);

    if (!result.success)
      return json({
        errors: {
          email: result.error.issues[0].message,
          password: result.error.issues[0].message,
        },
      });

    const { email, password, redirectTo } = result.data;

    const { user, error } = await (await signUp({ email, password })).json();

    if (error) {
      if (error.includes('email'))
        return json({ errors: { email: error, password: null } });
      else return json({ errors: { email: error, password: error } });
    }
    if (!user)
      return json({ errors: { email: 'User not found', password: null } });

    return await createSession({
      userId: user.id,
      redirectTo,
    });
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const meta: MetaFunction = () => [{ title: 'Sign up' }];

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const data = useActionData<typeof action>();
  const isDesktop = useMediaQuery('(min-width: 64em)');
  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      email: '',
      password: '',
      // terms: false,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!values.email.includes('@') || !values.email.includes('.')) {
        errors.email = 'Email must be valid';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (values.password.length > 50) {
        errors.password = 'Password must be less than 50 characters';
      } else if (!values.password.match(/[a-z]/g)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!values.password.match(/[A-Z]/g)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!values.password.match(/[0-9]/g)) {
        errors.password = 'Password must contain at least one number';
      } else if (!values.password.match(/[$&+,:;=?@#|'<>.^*()%!-]/g)) {
        errors.password =
          'Password must contain at least one special character';
      } else if (values.password.match(/[^a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-]/g)) {
        errors.password =
          'Password must only contain letters, numbers, and special characters';
      }
      // if (!values.terms) {
      //   errors.terms = 'You must accept terms and conditions';
      // }

      return errors;
    },
  });

  return (
    <Paper radius='md' p='xl' withBorder pos='relative'>
      <Stack>
        <Text className='md:text2-xl text-4xl lg:text-xl' fw={500}>
          Welcome to Bloompass, sign up with
        </Text>

        <Form method='post' action='/signup'>
          <Stack>
            <TextInput
              label='Email'
              name='email'
              type='email'
              size={isDesktop ? 'md' : 'xl'}
              withAsterisk
              placeholder='Your email'
              radius='md'
              {...form.getInputProps('email')}
              error={data?.errors?.email || form.errors.email}
            />
            {redirectTo && (
              <input type='hidden' name='redirectTo' value={redirectTo} />
            )}

            {/* <PasswordStrength
              {...form.getInputProps('password')}
              error={data?.errors?.password || form.errors.password}
            /> */}

            <PasswordInput
              label='Password'
              name='password'
              required
              size={isDesktop ? 'md' : 'xl'}
              withAsterisk
              placeholder='Your password'
              radius='md'
              {...form.getInputProps('password')}
              error={data?.errors?.password || form.errors.password}
            />

            {/* <Checkbox
              label='I accept terms and conditions'
              size={isDesktop ? 'md' : 'xl'}
              name='terms'
              {...form.getInputProps('terms', { type: 'checkbox' })}
              error={form.errors.terms}
            /> */}
          </Stack>

          <Group justify='apart' mt='xl'>
            <Anchor
              component='button'
              type='button'
              c='dimmed'
              className='md:text-md text-xl lg:text-sm'>
              <Link
                to={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ''}`}>
                Already have a user account? Login
              </Link>
            </Anchor>
            <Button
              type='submit'
              radius='xl'
              style={{ background: 'green' }}
              // disabled={!form.values.terms}
            >
              <Text className='text-xl md:text-xl lg:text-lg'>Sign Up</Text>
            </Button>
          </Group>
        </Form>
      </Stack>
    </Paper>
  );
}
