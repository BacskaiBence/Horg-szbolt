import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./App.css";

function Home({isLoggedIn}) {

  const [showPopup, setShowPopup] = useState(false);
    const [products, setproducts] = useState([]);
    const [formData, setFormData] = useState({ name: '', description: '', price: '', quantity: '', password: '',image: '' });
    const [message, setMessage] = useState(null);
    const [selectedP, setSelectedP] = useState(null);

    useEffect(() => {
        fetchproducts();
    }, []);

        const cimek = {
    name: 'Termék neve',
    description: 'Leírás',
    price: "Ár",
    quantity: "Mennyiség",
};

    const navigate = useNavigate();

    const fetchproducts = async () => {
        try {
            const res = await fetch('http://localhost:3000/products/get',{
                method: "GET",
                headers:{ "Content-Type" : "application/json"}
            }
            );
            const data = await res.json();
            setproducts(data);
        } catch (err) {
            console.error(err);
        }
    };

  return (
      <>
    {!isLoggedIn ? (
      <Container className="py-5">
            
            <h1 className="text-center mb-5 display-4">Termékek</h1>
            <div>
                {products.map(product => {
                    const isEditing = product.id === selectedP;
                    return (
                        <div key={product.id} >
                            <Card className="h-100 shadow-lg border-0">
                                <Card.Body className="p-5">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className="badge bg-primary fs-6 px-3 py-2">ID: {product.id}</div>
                                    </div>

                                    <Form>
                                         {['name', 'description', 'price', 'quantity'].map(field => (
                                                <Form.Group key={field} className="mb-3">
                                                    <Form.Label className="fw-bold text-black">
                                                        {cimek[field]}
                                                </Form.Label>
                                                <Form.Control
                                                    
                                                    name={field}
                                                    value={isEditing ? formData[field] : (product[field])}
                                                    className={!isEditing ? 'bg-transparent text-black border-0' : ''}
                                                    style={!isEditing ? { boxShadow: 'none' } : {}}
                                                    disabled={!selectedP==product.id}
                                                />
                                            </Form.Group>
                                            
                                       ))}
                                    <div className="d-flex gap-3">
                                    <div className="text-center py-5">
                                        <Button variant="primary" size="lg" onClick={() => setShowPopup(true)}>
                                            Vásárlás
                                        </Button>
                                    </div>
                                        {/*<Popup show={showPopup} onClose={() => setShowPopup(false)} title="Bejelentkezés szükséges">
                                            <p className='text-black'>A kosár használatához jelentkezz be!</p>
                                            <Button variant="primary" onClick={() => navigate('/login')}>Bejelentkezés</Button>
                                        </Popup>*/}
                                    </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </Container>
    ) : (
      
      <Container className="py-5">
            <h1>Üdvözöllek: {username}</h1>
            <h1 className="text-center mb-5 display-4">Termékek</h1>
            <div>
                {products.map(product => {
                    const isEditing = product.id === selectedP;
                    return (
                        <div key={product.id} >
                            <Card className="h-100 shadow-lg border-0">
                                <Card.Body className="p-5">
                                    <div className="d-flex justify-content-between align-items-start mb-4">
                                        <div className="badge bg-primary fs-6 px-3 py-2">ID: {product.id}</div>
                                    </div>
                                    <Form>
                                         {['name', 'description', 'price', 'quantity'].map(field => (
                                                <Form.Group key={field} className="mb-3">
                                                    <Form.Label className="fw-bold text-black">
                                                        {cimek[field]}
                                                </Form.Label>
                                                <Form.Control
                                                    name={field}
                                                    value={isEditing ? formData[field] : (product[field])}
                                                    className={!isEditing ? 'bg-transparent text-black border-0' : ''}
                                                    style={!isEditing ? { boxShadow: 'none' } : {}}
                                                    disabled={!selectedP==product.id}
                                                />                                               
                                            </Form.Group>   
                                       ))}
                                       <div className="d-flex gap-3">
                                             <Button onClick={() => handleBuy(product.id)}>
                                              Vásárlás
                                              </Button>
                                              </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </Container>
    )
    }      
    </>
  );
}

export default Home;
