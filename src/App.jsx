import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Dialog, 
  DialogContent, 
  IconButton,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { PlayArrow, Close, CalendarToday, Schedule, LocationOn, EventSeat } from '@mui/icons-material';

// Custom TikTok icon
const TikTokIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const selectedDate = 'Oct 15, 2024';
  const selectedTime = '7:30 PM';
  const selectedTheater = 'Galaxy Theater';

  const handleBuyTicket = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSeatClick = (seatId) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  // Generate seat grid (10 rows, 14 seats per row)
  const generateSeats = () => {
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    rows.forEach(row => {
      for (let i = 1; i <= 14; i++) {
        const seatId = `${row}${i}`;
        const isOccupied = Math.random() < 0.3; // 30% chance of being occupied
        const isSelected = selectedSeats.includes(seatId);
        
        seats.push({
          id: seatId,
          row,
          number: i,
          occupied: isOccupied,
          selected: isSelected
        });
      }
    });
    
    return seats;
  };

  const seats = generateSeats();
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#0a1a1a',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/backdrop.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to right, rgba(10,26,26,0.9) 0%, rgba(10,26,26,0.7) 50%, rgba(10,26,26,0.4) 100%)',
          }
        }}
      />

      {/* Top Navigation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left Navigation */}
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>ABOUT</Typography>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>VIDEOS</Typography>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>FEATURED</Typography>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>GALLERY</Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ height: '100%', position: 'relative', zIndex: 5, width: '100%', display: 'flex' }}>
        {/* Left Content */}
        <Box
          sx={{
            width: '70%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            pt: '25vh',
            pl: { xs: 3, md: 6 },
            pr: { xs: 3, md: 4 },
          }}
        >
          {/* Next Zen Productions Presents */}
          <Typography
            sx={{
              color: '#00ff88',
              fontSize: '12px',
              fontWeight: 600,
              mb: 2,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Next Zen Productions Presents
          </Typography>

          {/* Movie Title */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.8rem', md: '5.6rem' },
              fontWeight: 900,
              color: 'white',
              fontFamily: '"Bebas Neue", sans-serif',
              lineHeight: 0.9,
              mb: 3,
              textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
            }}
          >
            Janai Harayeko Manche
          </Typography>

          {/* Movie Description */}
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '16px',
              lineHeight: 1.6,
              mb: 4,
              maxWidth: '500px',
              fontFamily: 'Roboto, sans-serif',
            }}
          >              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </Typography>

          {/* Buy Ticket Button */}
          <Button
            onClick={handleBuyTicket}
            sx={{
              color: 'white',
              borderColor: 'white',
              borderRadius: 0,
              px: 4,
              py: 1.5,
              fontSize: '14px',
              fontWeight: 500,
              alignSelf: 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderColor: '#00ff88',
                color: '#00ff88',
              },
              border: '1px solid white',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Buy Ticket →
          </Button>
        </Box>

        {/* Right Sidebar - Absolutely positioned */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '30%',
            height: '100%',
            backgroundColor: 'rgba(0,20,20,0.95)',
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'left',
            zIndex: 6,
          }}
        >
            {/* Top Section */}
            <Box>
              {/* Premiere Date */}
              <Typography sx={{ color: 'white', fontSize: '12px', mb: 0.5 }}>PREMIERE</Typography>
              <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 500, mb: 3 }}>4 October 2019</Typography>

              {/* Director */}
              <Typography sx={{ color: 'white', fontSize: '12px', mb: 0.5 }}>DIRECTOR</Typography>
              <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 500, mb: 3 }}>Himal Neupane</Typography>

              {/* Starring */}
              <Typography sx={{ color: 'white', fontSize: '12px', mb: 0.5 }}>STARRING</Typography>
              <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 500, mb: 3 }}>Bijay Baral, Keki Adhikari, Mrunal Thakur</Typography>

              {/* Genre */}
              <Typography sx={{ color: 'white', fontSize: '12px', mb: 1 }}>GENRE</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                <Chip label="Family Drama" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '11px' }} />
              </Box>
            </Box>

            {/* Bottom Section - Trailer */}
            <Box>
              <Box
                onClick={() => window.open('https://www.youtube.com/watch?v=bJl4i00eOas', '_blank')}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                {/* Trailer Background */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url(/backdrop.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.7)',
                  }}
                />
                
                {/* Play Button */}
                <Box
                  className="play-button"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#dc2626',
                    }
                  }}
                >
                  <PlayArrow sx={{ fontSize: '30px', color: '#000', ml: '4px' }} />
                </Box>

                {/* Watch Trailer Text */}
                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  WATCH TRAILER
                </Typography>
              </Box>
            </Box>
        </Box>
      </Box>

      {/* Buy Ticket Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            margin: 0,
            maxHeight: '100vh',
            height: '100vh',
            maxWidth: '100vw',
            width: '100vw',
            borderRadius: 0,
            overflow: 'hidden',
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', height: '100vh' }}>
          {/* Dialog Background */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: 'url(/backdrop.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.8)',
              }
            }}
          />

          {/* Close Button */}
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 1000,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            <Close />
          </IconButton>

          {/* Dialog Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 10,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: 4,
              pt: '2vh', // Move content up by reducing top padding
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                  fontFamily: '"Bebas Neue", sans-serif',
                }}
              >
                Select Your Seats
              </Typography>
              
              {/* Movie Info Bar */}
              <Box sx={{ display: 'flex', gap: 4, alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ color: '#00ff88', fontSize: '18px' }} />
                  <Typography sx={{ color: 'white', fontSize: '14px' }}>{selectedDate}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Schedule sx={{ color: '#00ff88', fontSize: '18px' }} />
                  <Typography sx={{ color: 'white', fontSize: '14px' }}>{selectedTime}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ color: '#00ff88', fontSize: '18px' }} />
                  <Typography sx={{ color: 'white', fontSize: '14px' }}>{selectedTheater}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Main Content Area */}
            <Box sx={{ flex: 1, display: 'flex', gap: 4 }}>
              {/* Seat Selection Area */}
              <Box sx={{ flex: 1 }}>
                {/* Screen */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: '80%',
                      height: '8px',
                      background: 'linear-gradient(to right, transparent, #00ff88, transparent)',
                      margin: '0 auto',
                      borderRadius: '4px',
                      mb: 1,
                    }}
                  />
                  <Typography sx={{ color: '#00ff88', fontSize: '12px', letterSpacing: '2px' }}>
                    SCREEN
                  </Typography>
                </Box>

                {/* Seat Grid */}
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={0.5} justifyContent="center">
                    {seats.map((seat) => {
                  let backgroundColor;
                  if (seat.occupied) {
                    backgroundColor = '#666';
                  } else if (seat.selected) {
                    backgroundColor = '#00ff88';
                  } else {
                    backgroundColor = 'rgba(255,255,255,0.3)';
                  }

                  return (
                    <Grid item key={seat.id}>
                      <Box
                        onClick={() => !seat.occupied && handleSeatClick(seat.id)}
                        sx={{
                          width: '24px',
                          height: '24px',
                          backgroundColor,
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '4px',
                          cursor: seat.occupied ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          color: seat.selected ? 'black' : 'white',
                          '&:hover': seat.occupied ? {} : {
                            backgroundColor: seat.selected ? '#00ff88' : 'rgba(255,255,255,0.5)',
                          },
                          margin: seat.number === 7 || seat.number === 8 ? '0 8px 0 0' : '0',
                        }}
                      >
                        {seat.occupied ? (
                          <EventSeat sx={{ fontSize: '12px', color: '#333' }} />
                        ) : (
                          seat.selected && <EventSeat sx={{ fontSize: '12px' }} />
                        )}
                      </Box>
                    </Grid>
                  );
                })}
                  </Grid>
                </Box>

                {/* Legend */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '16px', height: '16px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                    <Typography sx={{ color: 'white', fontSize: '12px' }}>Available</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '16px', height: '16px', backgroundColor: '#00ff88', borderRadius: '2px' }} />
                    <Typography sx={{ color: 'white', fontSize: '12px' }}>Selected</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: '16px', height: '16px', backgroundColor: '#666', borderRadius: '2px' }} />
                    <Typography sx={{ color: 'white', fontSize: '12px' }}>Occupied</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Booking Summary */}
              <Paper
                sx={{
                  width: '300px',
                  backgroundColor: 'rgba(0,20,20,0.9)',
                  color: 'white',
                  p: 3,
                  border: '1px solid rgba(255,255,255,0.1)',
                  transform: 'translateY(-15%)',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: '#00ff88' }}>
                  Booking Summary
                </Typography>
                
                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                
                <Typography sx={{ fontSize: '14px', mb: 1 }}>Movie:</Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 'bold', mb: 2 }}>
                  Janai Harayeko Manche
                </Typography>
                
                <Typography sx={{ fontSize: '14px', mb: 1 }}>Date & Time:</Typography>
                <Typography sx={{ fontSize: '14px', mb: 2 }}>
                  {selectedDate} at {selectedTime}
                </Typography>
                
                <Typography sx={{ fontSize: '14px', mb: 1 }}>Theater:</Typography>
                <Typography sx={{ fontSize: '14px', mb: 2 }}>{selectedTheater}</Typography>
                
                <Typography sx={{ fontSize: '14px', mb: 1 }}>Selected Seats:</Typography>
                <Typography sx={{ fontSize: '14px', mb: 2, color: '#00ff88' }}>
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                </Typography>
                
                <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontSize: '14px' }}>
                    Tickets ({selectedSeats.length}):
                  </Typography>
                  <Typography sx={{ fontSize: '14px' }}>
                    ${(selectedSeats.length * 15).toFixed(2)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>Total:</Typography>
                  <Typography sx={{ fontSize: '16px', fontWeight: 'bold', color: '#00ff88' }}>
                    ${(selectedSeats.length * 15).toFixed(2)}
                  </Typography>
                </Box>
                
                <Button
                  fullWidth
                  disabled={selectedSeats.length === 0}
                  sx={{
                    backgroundColor: selectedSeats.length > 0 ? '#00ff88' : 'rgba(255,255,255,0.1)',
                    color: selectedSeats.length > 0 ? 'black' : 'rgba(255,255,255,0.5)',
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: selectedSeats.length > 0 ? '#00dd77' : 'rgba(255,255,255,0.1)',
                    },
                    '&:disabled': {
                      color: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  Continue to Payment
                </Button>
              </Paper>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default App;
