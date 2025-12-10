import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./App.css";

function Home() {
  return (
    <>
      <h1 className="page-title">Kezdőlap</h1>

      <Container className="cards-container">

        {/* 1. sor */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="custom-card">
              <Card.Img variant="top" src="holder.js/300x200" />
              <Card.Body>
                <Card.Title>Termék 1</Card.Title>
                <Card.Text>Leírás…</Card.Text>
                <Button variant="success">Megnézem</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="custom-card">
              <Card.Img variant="top" src="holder.js/300x200" />
              <Card.Body>
                <Card.Title>Termék 2</Card.Title>
                <Card.Text>Leírás…</Card.Text>
                <Button variant="success">Megnézem</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 2. sor */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="custom-card">
              <Card.Img variant="top" src="holder.js/300x200" />
              <Card.Body>
                <Card.Title>Termék 3</Card.Title>
                <Card.Text>Leírás…</Card.Text>
                <Button variant="success">Megnézem</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="custom-card">
              <Card.Img variant="top" src="holder.js/300x200" />
              <Card.Body>
                <Card.Title>Termék 4</Card.Title>
                <Card.Text>Leírás…</Card.Text>
                <Button variant="success">Megnézem</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* 3. sor */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="custom-card">
              <Card.Img variant="top" src="holder.js/300x200" />
              <Card.Body>
                <Card.Title>Termék 5</Card.Title>
                <Card.Text>Leírás…</Card.Text>
                <Button variant="success">Megnézem</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="custom-card">
              <Card.Img variant="top" src="holder.js/300x200" />
              <Card.Body>
                <Card.Title>Termék 6</Card.Title>
                <Card.Text>Leírás…</Card.Text>
                <Button variant="success">Megnézem</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </>
  );
}

export default Home;
