import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import WalletPersona from './components/WalletPersona';
import './App.css';

interface WalletData {
  success: boolean;
  address: string;
  details: any;
  persona: any;
}

function App() {
  const [address, setAddress] = useState<string>('');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/analyze-wallet', { address });
      setWalletData(response.data);
    } catch (err) {
      console.error('Error analyzing wallet:', err);
      setError('Failed to analyze wallet. Please try again.');
      setWalletData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="wallet-search-container">
      <h1 className="text-center mb-4">Wallet Persona Analyzer</h1>
      <Card className="p-4 mb-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Enter Ethereum Wallet Address</Form.Label>
            <Form.Control
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Form.Text className="text-muted">
              Enter a valid Ethereum wallet address to analyze its on-chain persona.
            </Form.Text>
          </Form.Group>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            className="w-100"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Analyzing...</span>
              </>
            ) : (
              'Analyze Wallet'
            )}
          </Button>
        </Form>
      </Card>

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {walletData && <WalletPersona data={walletData} />}
    </Container>
  );
}

export default App; 