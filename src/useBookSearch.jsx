import axios from "axios";
import { useEffect, useState } from "react";

const useBookSearch = (query, pageNumber) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [hasMore, setHasmore] = useState(false);
  const [bookCovers, setBookCovers] = useState([]);

  useEffect(() => {
    setBooks([]);
    setBookCovers([]);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    let cancel;
    const fetchData = async () => {
      try {
        const response = await axios({
          method: "GET",
          url: "https://openlibrary.org/search.json",
          params: { q: query, page: pageNumber },
          cancelToken: new axios.CancelToken((c) => (cancel = c)),
        });
        console.log(response);
        const newBooks = response.data.docs.map((b) => b.title);
        const newCovers = await Promise.all(
          response.data.docs.map(async (book) => {
            if (book.cover_i) {
              const coverResponse = await axios.get(
                `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
              );
              console.log(coverResponse.config.url);
              return coverResponse.config.url;
            } else {
              return null;
            }
          })
        );

        setBooks((prevBooks) => [...new Set([...prevBooks, ...newBooks])]);
        setBookCovers((prevCovers) => [
          ...new Set([...prevCovers, ...newCovers]),
        ]);
        setHasmore(response.data.docs.length > 0);
        setLoading(false);
      } catch (error) {
        setError(true);
        if (axios.isCancel(error)) return;
      }
    };
    fetchData();
    return () => cancel();
  }, [query, pageNumber]);

  return { loading, error, books, hasMore, bookCovers };
};

export default useBookSearch;
