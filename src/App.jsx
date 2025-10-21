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
  Divider,
  TextField,
  DialogTitle
} from '@mui/material';
import { PlayArrow, Close, CalendarToday, Schedule, LocationOn, Add, Remove, ConfirmationNumber } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';
import emailjs from '@emailjs/browser';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Initialize Supabase client
const supabaseUrl = 'https://gnjofqqwhvtkqdctwazt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imduam9mcXF3aHZ0a3FkY3R3YXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NTE1MDQsImV4cCI6MjA3NDUyNzUwNH0.d2NiU_sF8L-G-GRQeMQfSzr6Ji8sErPK24HbAm-Qhqo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Stripe - Production Mode (LIVE)
// TODO: Add your live publishable key here (pk_live_...)
// Get it from: https://dashboard.stripe.com/apikeys
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_YOUR_KEY_HERE');

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
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [purchasedTickets, setPurchasedTickets] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const selectedDate = 'November 1st, 2025';
  const selectedTime = '6:00 PM';
  const selectedVenue = '777 Kinnear Rd, Columbus, OH 43212';
  const ticketPrice = 15;

  // Initialize EmailJS
  useEffect(() => {
    console.log('🔧 Initializing EmailJS...');
    emailjs.init("FP5J_QH5IlVbKRRfv"); // Your actual public key
    console.log('✅ EmailJS initialized with public key: FP5J_QH5IlVbKRRfv');
  }, []);

  // Check for successful payment on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      handlePaymentSuccess(sessionId);
    }
  }, []);

  // Get customer email from Stripe session
  const getCustomerEmailFromStripe = async (sessionId) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-session-details', {
        body: { sessionId }
      });
      
      if (data && data.customer_email) {
        return data.customer_email;
      }
    } catch (error) {
      console.error('Error getting customer email:', error);
    }
    return null;
  };

  // Handle successful payment
  const handlePaymentSuccess = async (sessionId) => {
    try {
      // Get customer email from Stripe and show confirmation
      const email = await getCustomerEmailFromStripe(sessionId);
      console.log('🔍 Retrieved email from Stripe:', email);
      
      if (email) {
        setCustomerEmail(email);
        // Get ticket count from session metadata
        const ticketCount = 1; // Default, will be updated from Stripe metadata
        setPurchasedTickets(ticketCount);
        setSessionId(sessionId);
        
        console.log('📧 Sending email via EmailJS to:', email);
        await sendTicketEmail(email, ticketCount);
      } else {
        console.log('⚠️ No email retrieved from Stripe, will require manual input');
        setCustomerEmail('');
      }
      
      // Show confirmation dialog
      setConfirmationDialogOpen(true);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('Error handling payment success:', error);
    }
  };

  // Test email function directly
  const testEmailFunction = async () => {
    const testEmail = 'shibakriwo@gmail.com'; // Use your email for testing
    console.log('🧪 Testing email function with:', testEmail);
    
    try {
      const templateParams = {
        email: testEmail,
        to_email: testEmail,
        movie_title: 'Janai Harayeko Manche',
        show_date: selectedDate,
        show_time: selectedTime,
        venue: selectedVenue,
        ticket_count: 1,
        total_amount: `$${ticketPrice.toFixed(2)}`
      };

      console.log('🧪 Test template params:', templateParams);

      const result = await emailjs.send(
        'service_3898n7y',
        'template_bk2ftqf',
        templateParams,
        'FP5J_QH5IlVbKRRfv'
      );

      console.log('✅ Test email result:', result);
      alert('Email API call successful!');
    } catch (error) {
      console.error('❌ Test email error:', error);
      alert(`Test email failed: ${error.status} - ${error.text}`);
    }
  };

  // Send ticket via email automatically
  const sendTicketEmail = async (email, ticketCount) => {
    try {
      console.log('📧 Sending email to:', email);
      
      const templateParams = {
        email: email,
        to_email: email,
        movie_title: 'Janai Harayeko Manche',
        show_date: selectedDate,
        show_time: selectedTime,
        venue: selectedVenue,
        ticket_count: ticketCount,
        total_amount: `$${(ticketCount * ticketPrice).toFixed(2)}`
      };

      console.log('📋 Template params:', templateParams);

      await emailjs.send(
        'service_3898n7y',
        'template_bk2ftqf',
        templateParams,
        'FP5J_QH5IlVbKRRfv'
      );

      console.log('✅ Ticket email sent successfully to:', email);
    } catch (error) {
      console.error('❌ Error sending email:', error);
    }
  };

  // Generate and download PDF ticket
  const downloadTicketPDF = async () => {
    try {
      setLoading(true);
      
      // Create a temporary div with ticket content
      const ticketElement = document.createElement('div');
      ticketElement.innerHTML = `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 20px auto;
          padding: 30px;
          border: 2px solid #458500;
          border-radius: 10px;
          background-color: white;
        ">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #458500; margin: 0;">🎬 MOVIE TICKET</h1>
            <h2 style="color: #333; margin: 10px 0;">Next Zen Production</h2>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #458500; margin-top: 0;">Janai Harayeko Manche</h2>
            <div style="font-size: 16px; line-height: 1.6;">
              <p><strong>📅 Date:</strong> ${selectedDate}</p>
              <p><strong>🕒 Time:</strong> ${selectedTime}</p>
              <p><strong>📍 Venue:</strong> ${selectedVenue}</p>
              <p><strong>🎟️ Tickets:</strong> ${purchasedTickets}</p>
              <p><strong>💰 Total:</strong> $${(purchasedTickets * ticketPrice).toFixed(2)}</p>
            </div>
          </div>
          
          <div style="background-color: #458500; color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-weight: bold;">Booking ID: ${sessionId}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 8px;">
            <h3 style="color: #856404; margin-top: 0;">Important Information:</h3>
            <ul style="color: #856404; margin: 0;">
              <li>Please arrive 15 minutes before showtime</li>
              <li>Present this ticket at the entrance</li>
              <li>Outside food not permitted</li>
            </ul>
          </div>
        </div>
      `;
      
      // Temporarily add to DOM for rendering
      ticketElement.style.position = 'absolute';
      ticketElement.style.left = '-9999px';
      document.body.appendChild(ticketElement);
      
      // Generate canvas from HTML
      const canvas = await html2canvas(ticketElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary element
      document.body.removeChild(ticketElement);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`Movie-Ticket-${sessionId}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTicket = async () => {
    if (ticketQuantity < 1) return;
    
    setLoading(true);
    
    const requestData = {
      ticketQuantity: ticketQuantity,
      movieDetails: {
        title: 'Janai Harayeko Manche',
        date: selectedDate,
        time: selectedTime,
        venue: selectedVenue
      }
    };
    
    console.log('📤 Sending request to create-checkout-session:', JSON.stringify(requestData, null, 2));
    
    try {
      // Call Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: requestData
      });

      console.log('📥 Function response - data:', data, 'error:', error);

      if (error) {
        console.error('❌ Error creating checkout session:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        alert(`Failed to create checkout session: ${error.message || JSON.stringify(error)}`);
        return;
      }

      if (!data || !data.sessionId) {
        console.error('❌ No session ID in response:', data);
        alert('Failed to get session ID from server. Check console for details.');
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

          {/* Screening Info */}
          <Box sx={{ mb: 3, maxWidth: { xs: '100%', md: '500px' } }}>
            <Typography sx={{ color: '#00ff88', fontSize: '12px', fontWeight: 600, mb: 2, letterSpacing: '1px' }}>
              SPECIAL SCREENING
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarToday sx={{ color: '#00ff88', fontSize: '18px' }} />
                <Typography sx={{ color: 'white', fontSize: '14px' }}>{selectedDate}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Schedule sx={{ color: '#00ff88', fontSize: '18px' }} />
                <Typography sx={{ color: 'white', fontSize: '14px' }}>{selectedTime}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOn sx={{ color: '#00ff88', fontSize: '18px' }} />
                <Typography sx={{ color: 'white', fontSize: '14px' }}>{selectedVenue}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ConfirmationNumber sx={{ color: '#00ff88', fontSize: '18px' }} />
                <Typography sx={{ color: 'white', fontSize: '14px' }}>${ticketPrice} per ticket</Typography>
              </Box>
            </Box>
          </Box>

          {/* Ticket Quantity Selector */}
          <Box sx={{ mb: 3, maxWidth: { xs: '100%', md: '300px' } }}>
            <Typography sx={{ color: 'white', fontSize: '14px', mb: 1.5, fontWeight: 500 }}>
              Number of Tickets
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                sx={{
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: '#00ff88',
                  }
                }}
              >
                <Remove />
              </IconButton>
              <Typography sx={{ 
                color: 'white', 
                fontSize: '20px', 
                fontWeight: 'bold',
                minWidth: '40px',
                textAlign: 'center'
              }}>
                {ticketQuantity}
              </Typography>
              <IconButton
                onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                sx={{
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: '#00ff88',
                  }
                }}
              >
                <Add />
              </IconButton>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', ml: 2 }}>
                Total: ${(ticketQuantity * ticketPrice).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Buy Ticket Button */}
          <Button
            onClick={handleBuyTicket}
            disabled={loading}
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
              '&:disabled': {
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.3)',
              },
              border: '1px solid white',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {loading ? 'Processing...' : `Buy ${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''} →`}
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

      {/* Confirmation Dialog for Ticket Delivery */}
      <Dialog 
        open={confirmationDialogOpen} 
        onClose={() => setConfirmationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
          ✅ Payment Successful!
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
              Your tickets have been confirmed and sent to your email address.
            </Typography>
            
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 2, 
              mb: 3,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="h6" sx={{ mb: 1, color: '#333' }}>
                Janai Harayeko Manche
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                📅 {selectedDate}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                🕒 {selectedTime}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                📍 {selectedVenue}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                �️ Tickets: {purchasedTickets}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                💰 Total: ${(purchasedTickets * ticketPrice).toFixed(2)}
              </Typography>
              {customerEmail && (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  📧 Email sent to: {customerEmail}
                </Typography>
              )}
            </Box>

            <Box sx={{ 
              p: 2, 
              backgroundColor: '#e8f5e8', 
              borderRadius: 2, 
              mb: 3,
              border: '1px solid #4caf50'
            }}>
              {customerEmail ? (
                <>
                  <Typography variant="body2" sx={{ color: '#2e7d32', mb: 1 }}>
                    ✅ Ticket confirmation sent to your email
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                    📱 You can also download a PDF copy below
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" sx={{ color: '#f57c00', mb: 1 }}>
                    ⚠️ Email not retrieved automatically
                  </Typography>
                  <TextField
                    fullWidth
                    label="Enter your email to receive tickets"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setConfirmationDialogOpen(false)}
                sx={{ flex: 1 }}
              >
                Close
              </Button>
              {!customerEmail && (
                <Button
                  variant="outlined"
                  onClick={() => sendTicketEmail(customerEmail, purchasedTickets)}
                  disabled={loading || !customerEmail}
                  sx={{ flex: 1 }}
                >
                  {loading ? 'Sending...' : '📧 Send Email'}
                </Button>
              )}
              <Button
                variant="contained"
                onClick={downloadTicketPDF}
                disabled={loading}
                sx={{ 
                  flex: 1,
                  backgroundColor: '#2e7d32',
                  '&:hover': { backgroundColor: '#1b5e20' }
                }}
              >
                {loading ? 'Generating...' : '📄 Download PDF'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default App;
