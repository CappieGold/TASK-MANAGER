import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css';  // Assurez-vous d'importer votre CSS

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid className="p-4">
        <Row>
          <Col lg={6} md={12} className="mb-4 mb-md-0">
            <h5 className="text-uppercase">task-manager</h5>
            <p>
              Managemer des tâches et projets
            </p>
          </Col>

          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase">Links</h5>
            <ul className="list-unstyled mb-0">
              <li>
                <a href="#!" className="text-dark">Link 1</a>
              </li>
              <li>
                <a href="#!" className="text-dark">Link 2</a>
              </li>
              <li>
                <a href="#!" className="text-dark">Link 3</a>
              </li>
              <li>
                <a href="#!" className="text-dark">Link 4</a>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="text-uppercase">Links</h5>
            <ul className="list-unstyled mb-0">
              <li>
                <a href="#!" className="text-dark">Link 1</a>
              </li>
              <li>
                <a href="#!" className="text-dark">Link 2</a>
              </li>
              <li>
                <a href="#!" className="text-dark">Link 3</a>
              </li>
              <li>
                <a href="#!" className="text-dark">Link 4</a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>

      <div className="text-center p-3 bg-dark text-white">
        © 2024 Copyright:
        <a className="text-white" href="https://mdbootstrap.com/">Task-manager.com</a>
      </div>
    </footer>
  );
};

export default Footer;
