import { Stack, Text } from '@mantine/core';
export default function Footer() {
  return (
    <div style={{ backgroundColor: 'gray' }}>
      <Stack align='center' justify='center'>
        <Text c='white' size='xs'>
          Copyright @ Collin Pfeifer. Have problems or questions? Text (317)
          995-5114
        </Text>
      </Stack>
    </div>
  );
}
