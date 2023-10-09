import { useCallback, useEffect, useRef, useState } from "react";
import useBookSearch from "./useBookSearch";
import FeatherIcons from " feather-icons-react";

const App = () => {
  const [query, setQuery] = useState("Harry Potter");
  const [pageNumber, setPageNumber] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleSroll = () => {
      if (window.scrollY >= 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleSroll);
    return () => {
      window.removeEventListener("scroll", handleSroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const { loading, error, books, hasMore, bookCovers } = useBookSearch(
    query,
    pageNumber
  );
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      console.log(node);
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );
  const handleChange = (event) => {
    setQuery(event.target.value);
    setPageNumber(1);
  };
  console.log(books);
  return (
    <div className="App">
      <h1>Book Finder</h1>
      <p style={{ color: "#ccc" }}>Search for what ever you want...</p>
      <div className="searchBar">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search for your favorite book..."
        />
        <FeatherIcons icon="search" className="searc_icon" />
      </div>
      <div className="books-container">
        {books.map((book, index) => {
          if (books.length === index + 1) {
            return (
              <div key={book} ref={lastElementRef} className="book-item">
                <img
                  src={bookCovers[index]}
                  alt={`book cover ${index}`}
                  className="cover_src"
                />
                <div>{book}</div>
              </div>
            );
          } else {
            return (
              <div key={book} className="book-item">
                {bookCovers[index] ? (
                  <img src={bookCovers[index]} alt={`book cover ${index}`} />
                ) : (
                  <span className="lazy_load_wrapper">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/42/Loading.gif"
                      alt={`book cover ${index}`}
                      className="lazy_loading_image"
                    />
                  </span>
                )}
                <div className="book_title">{book}</div>
              </div>
            );
          }
        })}
      </div>
      <div className="messages">
        <div className={loading ? "loader" : ""}></div>
        <div className="text-center">{error && console.log(error)}</div>
      </div>
      <div
        className={`scroll-up ${scrolled ? "scrolled" : ""}`}
        onClick={scrollToTop}
      >
        <FeatherIcons icon="arrow-up" />
      </div>
      <div className="copyright">&copy; Islam Hafez</div>
    </div>
  );
};
export default App;
