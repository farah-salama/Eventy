import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import theme from '../theme';

const { accent } = theme;

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: theme.navbarFooterBg,
        borderRadius: '24px 24px 0 0',
        mt: 8,
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: accent,
                fontWeight: 900,
                letterSpacing: 1,
                mb: 2,
                display: 'block',
              }}
            >
              Eventy
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
              Your one-stop platform for discovering and booking amazing events. From concerts to workshops, we bring you the best experiences in your area.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: accent }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: accent }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: accent }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                component="a"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: accent }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/events"
                sx={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  '&:hover': { color: accent },
                }}
              >
                Browse Events
              </Link>
              <Link
                component={RouterLink}
                to="/booked-events"
                sx={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  '&:hover': { color: accent },
                }}
              >
                My Bookings
              </Link>
              <Link
                component={RouterLink}
                to="/profile"
                sx={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  '&:hover': { color: accent },
                }}
              >
                My Profile
              </Link>
              <Link
                component={RouterLink}
                to="/about"
                sx={{
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  '&:hover': { color: accent },
                }}
              >
                About Us
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, mb: 2 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: accent }} />
                <Typography sx={{ color: 'var(--text-secondary)' }}>
                  support@eventy.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: accent }} />
                <Typography sx={{ color: 'var(--text-secondary)' }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: accent }} />
                <Typography sx={{ color: 'var(--text-secondary)' }}>
                  123 Event Street, City, Country
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#f0f0f0' }} />

        {/* Copyright */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            © {new Date().getFullYear()} Eventy. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 