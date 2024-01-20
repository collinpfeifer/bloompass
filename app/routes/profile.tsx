import { LoaderFunction, LoaderFunctionArgs, json } from '@remix-run/node';
import { getUser } from '../session.server';
import {
  Box,
  Button,
  Card,
  NumberFormatter,
  Title,
  Text,
} from '@mantine/core';
import {
  retrieveAccount,
  retrieveBalance,
  transfer,
} from '../models/stripe.server';
import { Form, Link, useLoaderData } from '@remix-run/react';
import HeaderUser from '../components/headeruser';
import invariant from 'tiny-invariant';
import { notifications } from '@mantine/notifications';
import { updateUser } from '../models/user.server';

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const user = await getUser(request);
  const stripeAccount = await retrieveAccount(user?.stripeAccountId);
  const rootBalance = await retrieveBalance({ accountId: undefined });
  invariant(stripeAccount, 'Stripe account not found');
  invariant(
    stripeAccount?.capabilities,
    'Stripe account capabilities not found'
  );
  if (
    user?.stripeAccountId &&
    user?.onboardingComplete &&
    stripeAccount?.capabilities.transfers === 'active' &&
    stripeAccount?.capabilities.card_payments === 'active'
  ) {
    if (
      user?.balance > 0 &&
      rootBalance.available[0].amount / 100 >= user.balance
    ) {
      await transfer({
        amount: user.balance,
        destination: user.stripeAccountId,
        description: 'Balance transfer',
      });
      await updateUser({ id: user.id, balance: 0 });
    }
    const balance = await retrieveBalance({
      accountId: user?.stripeAccountId,
    });
    return json({
      user,
      available: balance.available[0].amount / 100,
      pending: balance.pending[0].amount / 100 + user?.balance,
      transfers: null,
      card_payments: null,
    });
  } else {
    return json({
      user,
      available: 0,
      pending: user?.balance,
      transfers: stripeAccount?.capabilities?.transfers,
      card_payments: stripeAccount?.capabilities?.card_payments,
    });
  }
};

export default function Profile() {
  const { user, available, pending, transfers, card_payments } =
    useLoaderData<typeof loader>();
  return (
    <>
      <HeaderUser user={user} />
      <Box mih='78.5dvh' maw={350}>
        <Card withBorder padding='xl' radius='md'>
          <Title>{user.email}</Title>
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
                      message: 'Your available balance is too low to payout',
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
                disabled={
                  !user.onboardingComplete ||
                  transfers === 'inactive' ||
                  card_payments === 'inactive'
                }
                type='submit'>
                Payout
              </Button>
            </Form>
            <Text size='xs'>
              Payouts automatically occur every 2 days, and your balances will
              be updated automatically when the payment is transfered, check
              back regularly.
            </Text>
          {!user.onboardingComplete && (
            <Button color='red' m='auto' my='md'>
              <Link
                to='/api/stripe/authorize'
                style={{ textDecoration: 'none', color: 'white' }}>
                Verify before you can pay out
              </Link>
            </Button>
          )}
          {user.onboardingComplete &&
            (transfers === 'inactive' || card_payments === 'inactive') && (
              <Button color='red' m='auto' my='md'>
                <Link
                  to='/api/stripe/update'
                  style={{ textDecoration: 'none', color: 'white' }}>
                  Update before you can pay out
                </Link>
              </Button>
            )}
        </Card>
      </Box>
    </>
  );
}
