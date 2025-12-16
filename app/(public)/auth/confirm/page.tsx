import { Paper, Typography } from '@mui/material';

import ConfirmAuth from '@/src/components/public/confirmAuth';

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ConfirmAuthPage(props: Props) {
  const searchParams = await props.searchParams;
  const token =
    typeof searchParams.token === 'string' ? searchParams.token : '';

  return (
    <Paper sx={{ p: 4, maxWidth: 400, margin: 'auto', mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Confirm Your Account
      </Typography>

      <ConfirmAuth token={token} />
    </Paper>
  );
}
