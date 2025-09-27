import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip, 
  Dialog, 
  DialogContent, 
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { PlayArrow, Close, CalendarToday, Schedule, LocationOn, EventSeat } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Supabase client
const supabaseUrl = 'https://gnjofqqwhvtkqdctwazt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduam9mcXF3aHZ0a3FkY3R3YXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTE1MDQsImV4cCI6MjA3NDUyNzUwNH0.d2NiU_sF8L-G-GRQeMQfSzr6Ji8sErPK24HbAm-Qhqo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Stripe - Test key for development
const stripePromise = loadStripe('pk_test_51S9wWyCOzTrWTYckDTAcJvKOjMrWyOAvCdRKX09nrcSID02RKalUnFYroWvZ5sixfxlywTopZ0cOjm8Z2aQEs94200WMRHafPZ');

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
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedDate = 'Oct 15, 2024';
  const selectedTime = '7:30 PM';
  const selectedTheater = 'Galaxy Theater';

  // Fetch occupied seats from Supabase
  const fetchOccupiedSeats = async () => {
    try {
      const { data, error } = await supabase
        .from('seats')
        .select('id')
        .in('status', ['occupied', 'held']);
      
      if (error) {
        console.error('Error fetching occupied seats:', error);
        return;
      }
      
      setOccupiedSeats(data.map(seat => seat.id));
    } catch (error) {
      console.error('Error fetching occupied seats:', error);
    }
  };

  // Set up real-time subscription for seat changes
  useEffect(() => {
    if (!dialogOpen) return;

    const channel = supabase
      .channel('seats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seats'
        },
        (payload) => {
          console.log('Seat change detected:', payload);
          // Refetch occupied seats when any change occurs
          fetchOccupiedSeats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dialogOpen]);

  const handleBuyTicket = async () => {
    setDialogOpen(true);
    await fetchOccupiedSeats();
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCheckout = async () => {
    if (selectedSeats.length === 0) return;

    setLoading(true);
    
    const requestData = {
      selectedSeats: selectedSeats,
      movieDetails: {
        title: 'Janai Harayeko Manche',
        date: selectedDate,
        time: selectedTime,
        theater: selectedTheater
      }
    };
    
    console.log('Sending request to create-checkout-session:', requestData);
    
    try {
      // Call Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: requestData
      });

      console.log('Function response - data:', data, 'error:', error);

      if (error) {
        console.error('Error creating checkout session:', error);
        alert(`Failed to create checkout session: ${error.message}`);
        return;
      }

      // Get Stripe instance and redirect to checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (stripeError) {
        console.error('Stripe redirect error:', stripeError);
        alert('Failed to redirect to payment. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId) => {
    // Don't allow selection of occupied seats
    if (occupiedSeats.includes(seatId)) {
      return;
    }
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  // Generate seat grid (10 rows, 14 seats per row) - memoized to prevent recreation
  const seats = React.useMemo(() => {
    const seatArray = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    rows.forEach(row => {
      for (let i = 1; i <= 14; i++) {
        const seatId = `${row}${i}`;
        
        seatArray.push({
          id: seatId,
          row,
          number: i,
          occupied: occupiedSeats.includes(seatId),
          selected: selectedSeats.includes(seatId)
        });
      }
    });
    
    return seatArray;
  }, [selectedSeats, occupiedSeats]);
  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        height: { xs: 'auto', md: '100vh' },
        display: 'flex',
        margin: 0,
        padding: 0,
        overflow: { xs: 'auto', md: 'hidden' },
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
          p: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left Navigation */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          gap: 4 
        }}>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>ABOUT</Typography>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>VIDEOS</Typography>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>FEATURED</Typography>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>GALLERY</Typography>
        </Box>
        
        {/* Mobile Menu Button */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Typography sx={{ color: 'white', fontSize: '14px', cursor: 'pointer' }}>☰ MENU</Typography>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ 
        height: '100%', 
        position: 'relative', 
        zIndex: 5, 
        width: '100%', 
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' }
      }}>
        {/* Left Content */}
        <Box
          sx={{
            width: { xs: '100%', md: '70%' },
            height: { xs: 'auto', md: '100%' },
            minHeight: { xs: '70vh', md: 'auto' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: { xs: 'center', md: 'flex-start' },
            pt: { xs: '20vh', md: '25vh' },
            pl: { xs: 2, md: 6 },
            pr: { xs: 2, md: 4 },
            pb: { xs: 4, md: 0 },
          }}
        >
          {/* Next Zen Productions Presents */}
          <Typography
            sx={{
              color: '#00ff88',
              fontSize: { xs: '10px', md: '12px' },
              fontWeight: 600,
              mb: { xs: 1, md: 2 },
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
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '5.6rem' },
              fontWeight: 900,
              color: 'white',
              fontFamily: '"Bebas Neue", sans-serif',
              lineHeight: 0.9,
              mb: { xs: 2, md: 3 },
              textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
            }}
          >
            Janai Harayeko Manche
          </Typography>

          {/* Movie Description */}
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '14px', md: '16px' },
              lineHeight: 1.6,
              mb: { xs: 3, md: 4 },
              maxWidth: { xs: '100%', md: '500px' },
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

        {/* Right Sidebar - Responsive positioning */}
        <Box
          sx={{
            position: { xs: 'relative', md: 'absolute' },
            top: { xs: 'auto', md: 0 },
            right: { xs: 'auto', md: 0 },
            width: { xs: '100%', md: '30%' },
            height: { xs: 'auto', md: '100%' },
            backgroundColor: 'rgba(0,20,20,0.95)',
            p: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'row', md: 'column' },
            justifyContent: { xs: 'space-between', md: 'space-between' },
            textAlign: 'left',
            zIndex: 6,
            gap: { xs: 3, md: 0 },
          }}
        >
            {/* Top Section */}
            <Box sx={{ flex: { xs: 1, md: 'none' } }}>
              {/* Premiere Date */}
              <Typography sx={{ color: 'white', fontSize: { xs: '10px', md: '12px' }, mb: 0.5 }}>PREMIERE</Typography>
              <Typography sx={{ color: 'white', fontSize: { xs: '14px', md: '16px' }, fontWeight: 500, mb: { xs: 2, md: 3 } }}>4 October 2019</Typography>

              {/* Director */}
              <Typography sx={{ color: 'white', fontSize: { xs: '10px', md: '12px' }, mb: 0.5 }}>DIRECTOR</Typography>
              <Typography sx={{ color: 'white', fontSize: { xs: '14px', md: '16px' }, fontWeight: 500, mb: { xs: 2, md: 3 } }}>Himal Neupane</Typography>

              {/* Starring - Hide on mobile */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ color: 'white', fontSize: '12px', mb: 0.5 }}>STARRING</Typography>
                <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 500, mb: 3 }}>Bijay Baral, Keki Adhikari, Mrunal Thakur</Typography>
              </Box>

              {/* Genre */}
              <Typography sx={{ color: 'white', fontSize: { xs: '10px', md: '12px' }, mb: 1 }}>GENRE</Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: { xs: 2, md: 4 } }}>
                <Chip label="Family Drama" size="small" sx={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: { xs: '10px', md: '11px' } }} />
              </Box>
            </Box>

            {/* Bottom Section - Trailer */}
            <Box sx={{ flex: { xs: 1, md: 'none' } }}>
              <Box
                onClick={() => window.open('https://www.youtube.com/watch?v=bJl4i00eOas', '_blank')}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: '120px', md: '200px' },
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
                    width: { xs: '40px', md: '60px' },
                    height: { xs: '40px', md: '60px' },
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
                  <PlayArrow sx={{ fontSize: { xs: '20px', md: '30px' }, color: '#000', ml: '4px' }} />
                </Box>

                {/* Watch Trailer Text */}
                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: { xs: 8, md: 16 },
                    left: { xs: 8, md: 16 },
                    color: 'white',
                    fontSize: { xs: '12px', md: '14px' },
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
              p: { xs: 2, md: 4 },
              pt: { xs: '5vh', md: '2vh' },
            }}
          >
            {/* Header */}
            <Box sx={{ mb: { xs: 2, md: 4 } }}>
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontSize: { xs: '1.5rem', md: '2.125rem' },
                }}
              >
                Select Your Seats
              </Typography>
              
              {/* Movie Info Bar */}
              <Box              sx={{ 
                display: 'flex', 
                gap: { xs: 2, md: 4 }, 
                alignItems: { xs: 'flex-start', sm: 'center' }, 
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' }
              }}>
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
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              gap: { xs: 2, md: 4 },
              flexDirection: { xs: 'column', lg: 'row' }
            }}>
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
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((rowLetter) => (
                    <Box key={rowLetter} sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: { xs: '2px', md: '4px' }, 
                      mb: { xs: '2px', md: '4px' },
                      alignItems: 'center'
                    }}>
                      {/* Row Label */}
                      <Typography sx={{ 
                        color: 'white', 
                        fontSize: { xs: '10px', md: '12px' }, 
                        width: '20px', 
                        textAlign: 'center',
                        mr: 1
                      }}>
                        {rowLetter}
                      </Typography>
                      
                      {/* Seats in this row */}
                      {seats.filter(seat => seat.row === rowLetter).map((seat) => {
                        let backgroundColor;
                        if (seat.occupied) {
                          backgroundColor = '#666';
                        } else if (seat.selected) {
                          backgroundColor = '#00ff88';
                        } else {
                          backgroundColor = 'rgba(255,255,255,0.3)';
                        }

                        return (
                          <Box
                            key={seat.id}
                            onClick={() => !seat.occupied && handleSeatClick(seat.id)}
                            sx={{
                              width: { xs: '16px', sm: '20px', md: '24px' },
                              height: { xs: '16px', sm: '20px', md: '24px' },
                              backgroundColor,
                              border: '1px solid rgba(255,255,255,0.2)',
                              borderRadius: '4px',
                              cursor: seat.occupied ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: { xs: '6px', md: '8px' },
                              color: seat.selected ? 'black' : 'white',
                              '&:hover': seat.occupied ? {} : {
                                backgroundColor: seat.selected ? '#00ff88' : 'rgba(255,255,255,0.5)',
                              },
                              // Add gap for aisle (between seats 7 and 8)
                              marginRight: seat.number === 7 ? { xs: '8px', md: '12px' } : '0',
                            }}
                          >
                            {seat.occupied ? (
                              <EventSeat sx={{ fontSize: { xs: '8px', md: '12px' }, color: '#333' }} />
                            ) : (
                              seat.selected && <EventSeat sx={{ fontSize: { xs: '8px', md: '12px' } }} />
                            )}
                          </Box>
                        );
                      })}
                      
                      {/* Row Label on right side */}
                      <Typography sx={{ 
                        color: 'white', 
                        fontSize: { xs: '10px', md: '12px' }, 
                        width: '20px', 
                        textAlign: 'center',
                        ml: 1
                      }}>
                        {rowLetter}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Legend */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: { xs: 2, md: 3 }, 
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center'
                }}>
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
                  width: { xs: '100%', lg: '300px' },
                  backgroundColor: 'rgba(0,20,20,0.9)',
                  color: 'white',
                  p: { xs: 2, md: 3 },
                  border: '1px solid rgba(255,255,255,0.1)',
                  transform: { xs: 'none', lg: 'translateY(-15%)' },
                  maxHeight: { xs: 'none', lg: 'fit-content' },
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
                  disabled={selectedSeats.length === 0 || loading}
                  onClick={handleCheckout}
                  sx={{
                    backgroundColor: selectedSeats.length > 0 && !loading ? '#00ff88' : 'rgba(255,255,255,0.1)',
                    color: selectedSeats.length > 0 && !loading ? 'black' : 'rgba(255,255,255,0.5)',
                    fontWeight: 'bold',
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: selectedSeats.length > 0 && !loading ? '#00dd77' : 'rgba(255,255,255,0.1)',
                    },
                    '&:disabled': {
                      color: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
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
