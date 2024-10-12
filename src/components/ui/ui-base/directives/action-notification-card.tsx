import React, { FC, memo } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface ActionNotificationCardProps {
  actionMessage: string;
}

const ActionNotificationCard: FC<ActionNotificationCardProps> = memo(({ actionMessage }) => {
  return (
    <div>
      <span className="font-bold mb-2">Action Notification</span>
      <Typography variant="body1" color="text.secondary">
        {actionMessage}
      </Typography>
    </div>
  );
});

export default ActionNotificationCard;
