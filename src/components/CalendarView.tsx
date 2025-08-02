import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Chip,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { Company } from '../types';

interface CalendarViewProps {
  companies: Company[];
  onEditCompany: (company: Company) => void;
  onRefresh: () => void;
}

interface CalendarDay {
  date: Date;
  companies: Company[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  companies,
  onEditCompany,
  onRefresh,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentDate, setCurrentDate] = useState(new Date());

  const { calendarDays, monthYear } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const current = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayCompanies = companies.filter(company => {
        const applicationDate = company.application_date;
        const updatedDate = company.updated_at?.split('T')[0];
        return applicationDate === dateStr || updatedDate === dateStr;
      });
      
      days.push({
        date: new Date(current),
        companies: dayCompanies,
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return {
      calendarDays: days,
      monthYear: `${year}年${month + 1}月`,
    };
  }, [currentDate, companies]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: Company['status']) => {
    switch (status) {
      case '合格':
        return '#4caf50';
      case '不合格':
        return '#f44336';
      case '選考中':
        return '#2196f3';
      default:
        return '#757575';
    }
  };


  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigateMonth('prev')} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 600,
              color: '#323338',
              minWidth: '140px',
              textAlign: 'center',
            }}
          >
            {monthYear}
          </Typography>
          <IconButton onClick={() => navigateMonth('next')} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Box>
        
        <IconButton
          onClick={goToToday}
          sx={{
            bgcolor: '#6c5dd3',
            color: 'white',
            '&:hover': {
              bgcolor: '#5a4fcf',
            },
          }}
        >
          <TodayIcon />
        </IconButton>
      </Box>

      <Card sx={{ overflow: 'hidden' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Week headers */}
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(7, 1fr)"
            sx={{ 
              bgcolor: '#f8f9fa' 
            }}
          >
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <Box
                key={day}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRight: index < 6 ? '1px solid #e1e4e7' : 'none',
                  color: index === 0 ? '#f44336' : index === 6 ? '#2196f3' : '#676879',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* Calendar grid */}
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(7, 1fr)"
            sx={{ minHeight: '600px' }}
          >
            {calendarDays.map((day, index) => (
              <Box
                key={day.date.toISOString()}
                sx={{
                  borderRight: (index + 1) % 7 !== 0 ? '1px solid #e1e4e7' : 'none',
                  borderBottom: index < calendarDays.length - 7 ? '1px solid #e1e4e7' : 'none',
                  minHeight: '100px',
                  p: 1,
                  bgcolor: day.isCurrentMonth ? 'white' : '#f8f9fa',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: day.isCurrentMonth ? '#f1f2f4' : '#f0f1f3',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: day.isCurrentMonth 
                        ? (day.isToday ? '#6c5dd3' : '#323338')
                        : '#9e9e9e',
                      fontWeight: day.isToday ? 600 : 400,
                      fontSize: '14px',
                      bgcolor: day.isToday ? '#e3f2fd' : 'transparent',
                      borderRadius: day.isToday ? '50%' : 'none',
                      width: day.isToday ? '24px' : 'auto',
                      height: day.isToday ? '24px' : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {day.date.getDate()}
                  </Typography>
                </Box>

                {day.companies.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {day.companies.slice(0, isMobile ? 2 : 3).map(company => (
                      <Tooltip key={company.id} title={company.name}>
                        <Chip
                          label={company.name}
                          size="small"
                          onClick={() => onEditCompany(company)}
                          sx={{
                            mb: 0.5,
                            mr: 0.5,
                            fontSize: '10px',
                            height: '20px',
                            maxWidth: '100%',
                            bgcolor: getStatusColor(company.status),
                            color: 'white',
                            '& .MuiChip-label': {
                              px: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: isMobile ? '60px' : '80px',
                            },
                            '&:hover': {
                              bgcolor: getStatusColor(company.status),
                              opacity: 0.8,
                              cursor: 'pointer',
                            },
                          }}
                        />
                      </Tooltip>
                    ))}
                    
                    {day.companies.length > (isMobile ? 2 : 3) && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#676879',
                          fontSize: '10px',
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        +{day.companies.length - (isMobile ? 2 : 3)}件
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Legend */}
      <Box
        display="flex"
        justifyContent="center"
        gap={3}
        mt={3}
        sx={{
          flexWrap: 'wrap',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#4caf50',
            }}
          />
          <Typography variant="caption" sx={{ color: '#676879' }}>
            合格
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#2196f3',
            }}
          />
          <Typography variant="caption" sx={{ color: '#676879' }}>
            選考中
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#f44336',
            }}
          />
          <Typography variant="caption" sx={{ color: '#676879' }}>
            不合格
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CalendarView;