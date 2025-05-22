import React from 'react';
import { Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';

interface WalletPersonaProps {
  data: {
    address: string;
    details: any;
    persona: {
      category: string;
      tags: string[];
      bio: string;
      riskScore: number;
      activityLevel: string;
      recommendations: string[];
    };
  };
}

const WalletPersona: React.FC<WalletPersonaProps> = ({ data }) => {
  const { address, persona, details } = data;
  
  const getRiskColor = (score: number) => {
    if (score < 30) return 'success';
    if (score < 70) return 'warning';
    return 'danger';
  };

  return (
    <Card className="wallet-persona-card">
      <Card.Header className="persona-header">
        <h2>Wallet Profile</h2>
        <p className="mb-0">Address: {address}</p>
      </Card.Header>
      
      <Card.Body>
        <div className="persona-section">
          <h3>Persona Category</h3>
          <h4>{persona.category}</h4>
          <div className="my-3">
            {persona.tags.map((tag, index) => (
              <Badge 
                key={index} 
                bg="primary" 
                className="me-2 mb-2"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <p>{persona.bio}</p>
        </div>
        
        <div className="persona-section">
          <Row>
            <Col md={6}>
              <h3>Risk Assessment</h3>
              <div className="d-flex align-items-center">
                <h4 className={`text-${getRiskColor(persona.riskScore)}`}>
                  {persona.riskScore}/100
                </h4>
                <span className="ms-3">
                  ({persona.riskScore < 30 ? 'Low' : persona.riskScore < 70 ? 'Medium' : 'High'} Risk)
                </span>
              </div>
            </Col>
            <Col md={6}>
              <h3>Activity Level</h3>
              <h4>{persona.activityLevel}</h4>
            </Col>
          </Row>
        </div>
        
        <div className="persona-section">
          <h3>Personalized Recommendations</h3>
          <ListGroup variant="flush">
            {persona.recommendations.map((rec, index) => (
              <ListGroup.Item key={index}>
                {rec}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </Card.Body>
    </Card>
  );
};

export default WalletPersona; 