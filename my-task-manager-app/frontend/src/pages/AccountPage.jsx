import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import './AccountPage.css'; // Importer le fichier CSS

const AccountPage = () => {
  const { token } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        } else {
          console.error("Failed to fetch user info", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (token) {
      fetchUserInfo();
    }
  }, [token]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setMessage("Mot de passe modifié avec succès.");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Échec de la modification du mot de passe.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Erreur lors de la modification du mot de passe.");
    }
  };

  return (
    <Container>
      <Card className="card-custom">
        <Card.Body>
          <h1>Mon Compte</h1>
          {userInfo && (
            <div>
              <p><strong>Nom d'utilisateur :</strong> {userInfo.username}</p>
              <p><strong>Email :</strong> {userInfo.email}</p>
            </div>
          )}
          <h2>Changer de mot de passe</h2>
          <Form.Group controlId="currentPassword" className="mb-3">
            <Form.Control
              type="password"
              placeholder="Mot de passe actuel"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="newPassword" className="mb-3">
            <Form.Control
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="confirmPassword" className="mb-3">
            <Form.Control
              type="password"
              placeholder="Confirmer le nouveau mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" onClick={handleChangePassword}>Changer le mot de passe</Button>
          {message && <Alert variant="info" className="mt-3">{message}</Alert>}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AccountPage;
