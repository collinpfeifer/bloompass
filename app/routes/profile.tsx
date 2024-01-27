import { LoaderFunction, LoaderFunctionArgs, json } from '@remix-run/node';
import { requireUser } from '../session.server';
import {
  Box,
  Button,
  Card,
  NumberFormatter,
  Title,
  Text,
  Stack,
} from '@mantine/core';
import { retrieveBalance } from '../models/stripe.server';
import { Form, Link, useLoaderData } from '@remix-run/react';
import HeaderUser from '../components/headeruser';
import { notifications } from '@mantine/notifications';
import { getSoldTicketsByUserId } from '~/models/ticket.server';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const user = await requireUser(request);
  if (!user.stripeAccountId) {
    let amount = 0;
    for (const ticket of await (
      await getSoldTicketsByUserId({ userId: user?.id })
    ).json()) {
      amount += Number(ticket.price);
    }
    return json({
      user,
      available: 0,
      pending: amount,
    });
  } else {
    const balance = await retrieveBalance({
      accountId: user?.stripeAccountId,
    });
    return json({
      user,
      available: balance.available[0].amount / 100,
      pending: balance.pending[0].amount / 100,
    });
  }
};

export default function Profile() {
  const { user, available, pending } = useLoaderData<typeof loader>();
  return (
    <>
      <HeaderUser user={user} />
      <Stack mih='78.5dvh' miw={390} maw='25dvw'>
        <Card withBorder padding='xl' radius='md'>
          <Text>{user.email}</Text>
          <Text c='black' fw='bold'>
            Balance:{' '}
            <NumberFormatter prefix='$ ' value={available} thousandSeparator />
          </Text>
          <Text c='black' fw='bold'>
            Pending:{' '}
            <NumberFormatter prefix='$ ' value={pending} thousandSeparator />
          </Text>
          <Form
            onSubmit={async () => {
              const data = await (
                await fetch('/api/stripe/payout', {
                  method: 'POST',
                })
              ).json();
              if (data.error) {
                if (data.error.raw.code === 'parameter_invalid_integer') {
                  notifications.show({
                    title: 'Payout failed',
                    message: 'Your available balance has to be greater than $0',
                    color: 'red',
                  });
                } else {
                  notifications.show({
                    title: 'Payout failed',
                    message: data.error.raw.message,
                    color: 'red',
                  });
                }
              } else {
                notifications.show({
                  title: 'Payout successful',
                  message:
                    'Your payout was successful, and should be on its way shortly',
                  color: 'green',
                });
              }
            }}>
            <Button
              m='auto'
              my='lg'
              disabled={!user.onboardingComplete || available === 0}
              type='submit'>
              Payout
            </Button>
          </Form>
          {!user.onboardingComplete && (
            <Button
              color='red'
              my='md'
              m='auto'
              component={Link}
              to='/api/stripe/authorize'
              style={{
                textDecoration: 'none',
                color: 'white',
              }}>
              Verify Stripe account before you can payout
            </Button>
          )}
          {/* {user.onboardingComplete &&
            (transfers === 'inactive' || card_payments === 'inactive') && (
              <Button color='red' m='auto' my='md'>
                <Link
                  to='/api/stripe/update'
                  style={{ textDecoration: 'none', color: 'white' }}>
                  Update Stripe account before you can pay out
                </Link>
              </Button>
            )} */}
        </Card>
        <Card withBorder padding='xl' radius='md' my='md'>
          <Text style={{ fontSize: '10px' }}>
            **After your Stripe account is setup, your payment will transfered
            when the charge clears, payouts automatically occur every 2 days,
            your balances will be updated automatically when the payment is
            transfered, check back regularly. Transfers can take up to 7 days
            the first time.
          </Text>
        </Card>
      </Stack>
    </>
  );
}
