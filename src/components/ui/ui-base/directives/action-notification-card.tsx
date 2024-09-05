import React, { FC, memo } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface ActionNotificationCardProps {
  actionMessage: string;
}

const ActionNotificationCard: FC<ActionNotificationCardProps> = memo(({ actionMessage }) => {
  return (
    <Card sx={{ maxWidth: 400, margin: 'auto', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Action Notification
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {actionMessage}
        </Typography>
      </CardContent>
    </Card>
  );
});

export default ActionNotificationCard;
