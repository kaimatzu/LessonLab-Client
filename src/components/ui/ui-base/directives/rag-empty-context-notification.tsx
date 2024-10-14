import React, { FC, memo } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface RAGEmptyContextNotificationProps {
  notificationMessage: string;
}

// eslint-disable-next-line react/display-name
const RAGEmptyContextNotification: FC<RAGEmptyContextNotificationProps> = memo(({ notificationMessage }) => {
  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" sx={{ marginBottom: 1 }}>
          <ErrorIcon color="warning" sx={{ marginRight: 2 }} />
          <Typography variant="h6" component="div">
            No relevant information found within workspace
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          {notificationMessage}
        </Typography>
      </CardContent>
    </Card>
  );
});

export default RAGEmptyContextNotification;
