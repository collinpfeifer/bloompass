import {
  Anchor,
  Button,
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
import { login } from '../models/user.server';
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
  const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    redirectTo: z.string().optional(),
  });
  try {
    const result = userLoginSchema.safeParse(formData);
    if (!result.success)
      return json({
        errors: {
          email: result.error.issues[0].message,
          password: result.error.issues[0].message,
        },
      });

    const { email, password, redirectTo } = result.data;
    const { user, error } = await (await login({ email, password })).json();
    if (error) {
      if (error.includes('email'))
        return json({ errors: { email: error, password: null } });
      else return json({ errors: { email: error, password: error } });
    }
    if (!user)
      return json({ errors: { email: 'User not found', password: null } });
    if (user.banned)
      return json({
        errors: { email: 'You are banned', password: 'You are banned' },
      });
    return createSession({ userId: user.id, redirectTo });
  } catch (error) {
    console.log(error);
  }
};

export const meta: MetaFunction = () => [{ title: 'Login' }];

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const data = useActionData<typeof action>();
  const isDesktop = useMediaQuery('(min-width: 64em)');

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
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

      return errors;
    },
  });

  return (
    <Stack justify='center'>
      <Paper radius='md' p='xl' withBorder pos='relative'>
        <Stack>
          <Text className='md:text2-xl text-4xl lg:text-xl' fw={500}>
            Welcome to Bloompass, login with
          </Text>

          <Form method='post'>
            <Stack>
              <TextInput
                label='Email'
                name='email'
                type='email'
                size={isDesktop ? 'md' : 'xl'}
                withAsterisk
                required
                placeholder='Your email'
                radius='md'
                {...form.getInputProps('email')}
                error={data?.errors?.email || form.errors.email}
              />
              {redirectTo && (
                <input type='hidden' name='redirectTo' value={redirectTo} />
              )}

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
            </Stack>
            <Group justify='apart' mt='xl'>
              <Anchor
                component='button'
                type='button'
                c='dimmed'
                className='md:text-md text-xl lg:text-sm'>
                <Link
                  to={`/signup${redirectTo ? `redirectTo=${redirectTo}` : ''}`}>
                  Don&apos;t have an account? Sign up
                </Link>
              </Anchor>
              <Button type='submit' radius='xl' style={{ background: 'green' }}>
                <Text className='text-xl md:text-xl lg:text-lg'>Login</Text>
              </Button>
            </Group>
          </Form>
        </Stack>
      </Paper>
    </Stack>
  );
}
