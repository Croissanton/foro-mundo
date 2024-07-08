import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import { useState, forwardRef, useRef, useEffect } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useToast } from "../Context/ToastContext.js";
import { Link, useNavigate } from "react-router-dom";
import { FormLabel } from "react-bootstrap";

const Header = forwardRef((props, ref) => {
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setMobile] = useState(window.innerWidth < 992);
  const [isCollapsing, setIsCollapsing] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setMobile(window.innerWidth < 992);
    };
    // Set the initial state based on current window width
    handleResize();
    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove the listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerRef = useRef(null);
  const combinedRef = ref || containerRef;

  const usuario = localStorage.getItem("usuario") || undefined;

  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const topics = JSON.parse(localStorage.getItem("topics")) || [];
  const comments = posts.reduce(
    (acc, post) => [
      ...acc,
      ...post.comments.map((comment) => ({
        ...comment, // Spread all existing properties of the comment
      })),
    ],
    []
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (combinedRef.current && !combinedRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [combinedRef]);

  const toggleNavbar = () => {
    setExpanded((prev) => !prev);
    if (expanded) {
      setIsCollapsing(true);
      setTimeout(() => {
        setIsCollapsing(false);
      }, 400);
    }
  };

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    const userInput = event.target.value;
    setInputValue(userInput);

    if (!userInput.trim()) {
      setSuggestions(["No se ha encontrado ninguna sugerencia."]);
      setShowSuggestions(false);
    } else {
      const topicSuggestions = topics
        .filter((topic) =>
          topic.topic.toLowerCase().includes(userInput.toLowerCase())
        )
        .map((topic) => ({
          label: `Topic: ${topic.topic}`,
          type: "topic",
          id: topic.id,
        }));

      const postSuggestions = posts
        .filter((post) =>
          post.title.toLowerCase().includes(userInput.toLowerCase())
        )
        .map((post) => ({
          label: `Post: ${post.title}`,
          type: "post",
          id: post.id,
        }));

      const commentSuggestions = comments
        .filter((comment) =>
          comment.title.toLowerCase().includes(userInput.toLowerCase())
        )
        .map((comment) => ({
          label: `Comment in Post ${comment.postId}: ${comment.title}`,
          type: "comment",
          id: comment.id,
          postId: comment.postId,
        }));

      const combinedSuggestions = [
        ...topicSuggestions,
        ...postSuggestions,
        ...commentSuggestions,
      ];
      setSuggestions(combinedSuggestions.slice(0, 5));
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    setInputValue(suggestion.label);
    setSuggestions([]);

    switch (suggestion.type) {
      case "topic":
        navigate(`/buscar/${suggestion.id}`);
        break;
      case "post":
        navigate(`/post/${suggestion.id}`);
        break;
      case "comment":
        navigate(`/post/${suggestion.postId}`);
        break;
      default:
        console.log("Unknown suggestion type");
    }
  };

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!inputValue.trim()) {
      return;
    }
    console.log("Searching for:", inputValue);
    navigate(`/buscar?query=${encodeURIComponent(inputValue)}`);
  };

  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    showToast("Se ha cerrado la sesión!", "bg-success");
    navigate("/");
  };

  return (
    <Navbar
      ref={combinedRef}
      expand="lg"
      expanded={expanded}
      onToggle={toggleNavbar}
      className="header bg-primary border-bottom border-dark-subtle border-1 fixed-top"
    >
      <Container>
        <Navbar.Brand
          as={Link}
          to="/"
          id="brand"
          className="text-secondary m-auto"
        >
          Mundo Foro
        </Navbar.Brand>
        <Navbar.Toggle className="border-0" aria-controls="basic-navbar-nav" />
        <Navbar.Collapse className="my-1" id="basic-navbar-nav">
          <Nav className="w-100 justify-content-between">
            <div></div> {/* Placeholder for left alignment */}
            <Form
              onSubmit={handleSubmit}
              className={`d-flex my-2 ${
                expanded || isCollapsing ? "" : "w-50"
              }`}
              style={{ position: "relative" }}
            >
              <FormLabel htmlFor="searchInput" className="visually-hidden">
                Buscar
              </FormLabel>
              <FormControl
                title="Buscar"
                id="searchInput"
                type="search"
                className="me-2"
                aria-label="Buscar"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={() => {
                  setTimeout(() => {
                    setShowSuggestions(false);
                  }, 200);
                }}
                onFocus={() => {
                  if (inputValue && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                required
                autoComplete="off"
              />
              <Button
                className="d-flex"
                variant="outline-secondary"
                type="submit"
                aria-label="Buscar"
                disabled={!inputValue.trim()}
              >
                <span className="me-1">Buscar</span>
                <i className="bi bi-search"></i>
              </Button>
              {showSuggestions && inputValue && suggestions.length > 0 && (
                <div
                  className="bg-white"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "100%",
                    zIndex: 2,
                    border: "1px solid #ccc",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                  role="listbox"
                  aria-label="Sugerencias de búsqueda"
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      role="option"
                      tabIndex="0"
                      aria-selected={inputValue === suggestion.label}
                      style={{ padding: "10px", cursor: "likePointer" }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.label}
                    </div>
                  ))}
                </div>
              )}
            </Form>
            <Nav className="d-flex align-items-center justify-content-center h-100">
              {usuario !== undefined && (
                <>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip-create">Crear post</Tooltip>}
                  >
                    <Nav.Link
                      className="d-flex align-items-center justify-content-center"
                      as={Link}
                      to="/crear"
                      aria-label="Crear post"
                    >
                      {isMobile && <span className="me-2">Crear</span>}
                      <i className="bi bi-plus-circle custom-icon"></i>
                      <span className="visually-hidden">Crear post</span>
                    </Nav.Link>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip-profile">Perfil</Tooltip>}
                  >
                    <Nav.Link
                      className="d-flex align-items-center justify-content-center"
                      as={Link}
                      to="/perfil"
                      aria-label="Perfil"
                    >
                      {isMobile && <span className="me-2">Perfil</span>}
                      <i className="bi bi-person-circle custom-icon"></i>
                      <span className="visually-hidden">Perfil</span>
                    </Nav.Link>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip id="tooltip-messenger">Mensajes</Tooltip>}
                  >
                    <Nav.Link
                      className="d-flex align-items-center justify-content-center"
                      as={Link}
                      to="/mensajes"
                      aria-label="Mensajes"
                    >
                      {isMobile && <span className="me-2">Mensajes</span>}
                      <i className="bi bi-chat custom-icon"></i>
                      <span className="visually-hidden">Mensajes</span>
                    </Nav.Link>
                  </OverlayTrigger>
                </>
              )}
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip-help">Ayuda</Tooltip>}
              >
                <Nav.Link
                  className="d-flex align-items-center justify-content-center"
                  as={Link}
                  to="/ayuda"
                  aria-label="Ayuda"
                >
                  {isMobile && <span className="me-2">Ayuda</span>}
                  <i className="bi bi-question-circle custom-icon"></i>
                  <span className="visually-hidden">Ayuda</span>
                </Nav.Link>
              </OverlayTrigger>

              {usuario === undefined ? (
                <Nav.Link
                  as={Link}
                  to="/inicioSesion"
                  className="text-secondary m-auto custom-link"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Iniciar Sesión
                </Nav.Link>
              ) : (
                <Nav.Link
                  onClick={handleLogout}
                  className="text-secondary m-auto custom-link"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Cerrar Sesión
                </Nav.Link>
              )}
              {usuario === undefined ? (
                <Nav.Link
                  as={Link}
                  to="/registro"
                  className="text-secondary m-auto custom-link"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                  }}
                >
                  Registrarse
                </Nav.Link>
              ) : (
                <div></div>
              )}
            </Nav>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
});

export default Header;
