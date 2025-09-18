import React from 'react';
import { Box, Typography, IconButton, Container } from '@mui/material';
import { Instagram, Facebook } from '@mui/icons-material';

// Custom TikTok icon since Material UI doesn't have it
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
        background: '#000000',
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: '2.5%',
          width: '55%',
          height: '100%',
          backgroundImage: 'url(/Bhairava.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 1,
          mask: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0) 100%)',
          WebkitMask: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Content */}
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: '45%',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {/* Main Title */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
              fontWeight: 900,
              lineHeight: 0.9,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              fontFamily: '"Bebas Neue", "Arial Black", sans-serif',
              mb: 1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            NEXT ZEN
          </Typography>
          
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '3rem', md: '5rem', lg: '6rem' },
              fontWeight: 900,
              lineHeight: 0.9,
              color: '#dc2626',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              fontFamily: '"Bebas Neue", "Arial Black", sans-serif',
              mb: 3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            PRODUCTION
          </Typography>

          {/* Slogan */}
          <Typography
            variant="h6"
            sx={{
              color: '#ffffff',
              fontFamily: '"Roboto Condensed", sans-serif',
              fontWeight: 300,
              fontSize: { xs: '1rem', md: '1.2rem' },
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mb: 2,
              opacity: 0.9,
            }}
          >
            FUTURE OF FILM MAKING
          </Typography>

          {/* Coming Soon */}
          <Typography
            variant="h4"
            sx={{
              color: '#dc2626',
              fontFamily: '"Roboto Condensed", sans-serif',
              fontWeight: 400,
              fontSize: { xs: '1.5rem', md: '2rem' },
              letterSpacing: '0.05em',
              mb: 4,
              textTransform: 'uppercase',
            }}
          >
            Coming Soon...
          </Typography>

          {/* Social Media Icons */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
            }}
          >
            <IconButton
              sx={{
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: 50,
                height: 50,
                '&:hover': {
                  color: '#dc2626',
                  borderColor: '#dc2626',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Instagram />
            </IconButton>
            
            <IconButton
              sx={{
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: 50,
                height: 50,
                '&:hover': {
                  color: '#dc2626',
                  borderColor: '#dc2626',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Facebook />
            </IconButton>
            
            <IconButton
              sx={{
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                width: 50,
                height: 50,
                '&:hover': {
                  color: '#dc2626',
                  borderColor: '#dc2626',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <TikTokIcon />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default App;
