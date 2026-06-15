import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

export default function StudentStatusSummary({ waitingCount, passedCount, rejectedCount }) {
  const cards = [
    {
      title: 'รอดำเนินการ',
      value: waitingCount,
      bgColor: 'rgba(250, 204, 21, 0.1)',
      borderColor: 'rgba(250, 204, 21, 0.4)',
      textColor: '#b45309',
      icon: <HourglassEmptyIcon sx={{ fontSize: 28, color: '#d97706' }} />,
    },
    {
      title: 'ผ่าน',
      value: passedCount,
      bgColor: 'rgba(22, 163, 74, 0.1)',
      borderColor: 'rgba(22, 163, 74, 0.4)',
      textColor: '#15803d',
      icon: <CheckCircleIcon sx={{ fontSize: 28, color: '#16a34a' }} />,
    },
    {
      title: 'ไม่ผ่าน',
      value: rejectedCount,
      bgColor: 'rgba(220, 38, 38, 0.1)',
      borderColor: 'rgba(220, 38, 38, 0.4)',
      textColor: '#b91c1c',
      icon: <CancelIcon sx={{ fontSize: 28, color: '#dc2626' }} />,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: 3,
        width: '100%',
        mb: 4,
      }}
    >
      {cards.map((card, idx) => (
        <Card
          key={idx}
          component={motion.div}
          custom={idx}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover={{ y: -5, boxShadow: '0 12px 20px rgba(0, 0, 0, 0.08)' }}
          sx={{
            bgcolor: card.bgColor,
            border: `1px solid ${card.borderColor}`,
            borderRadius: 4,
            overflow: 'hidden',
            transition: 'border-color 0.2s',
          }}
        >
          <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" fontWeight="600" sx={{ color: card.textColor, opacity: 0.8, mb: 0.5 }}>
                {card.title}
              </Typography>
              <Typography variant="h4" fontWeight="800" sx={{ color: card.textColor }}>
                {card.value} <Typography component="span" variant="subtitle1" fontWeight="600">รายการ</Typography>
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.icon}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
