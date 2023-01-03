import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import MoviesTable from "./moviesTable";
import ListGroup from "./common/listGroup";
import Pagination from "./common/pagination";
import { getMovies, deleteMovie, saveMovie } from "../services/movieService";
import { getGenres } from "../services/genreService";
import { saveCustomer } from "../services/customerService";
import { paginate } from "../utilities/paginate";
import _ from "lodash";
import SearchBox from "./searchBox";

class Movies extends Component {
  state = {
    movies: [],
    genres: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: "",
    selectedGenre: null,
    sortColumn: { path: "title", order: "asc" },
  };

  async componentDidMount() {
    const { data } = await getGenres();
    const genres = [{ _id: "", name: "All Category" }, ...data];

    const { data: movies } = await getMovies();
    this.setState({ movies, genres });
  }

  handleCheckout = async (user) =>  {
    const inventory = [...this.state.movies];
    const items = inventory.filter((i) => i.numberOutStock > 0);

    // extract title, numberOutStock from items
    const data = items.map((item) => {
      const obj = { title: "", numberOutStock: 0 };
      obj.title = item.title;
      obj.numberOutStock = item.numberOutStock;

      return obj;
    });

    // create Transaction object
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const date = today.toLocaleDateString();

    const time = new Date().toLocaleTimeString(); // 11:18:48 AM

    const customer = {
      date,
      time,
      name: user.name,
      email: user.email,
      cart: [...data]
    };
    console.log('checkout customer: ', customer);
    await saveCustomer(customer);

    // update movies state numberInStock
    const updates = inventory.map((item) => {
      item.numberInStock = item.numberInStock -item.numberOutStock;
      item.numberOutStock = 0;

      return item;
    });

    console.log('updates',updates);
    updates.forEach(async(current) => {
      //await saveMovie(obj);
      const obj = {};
      obj._id = current._id;
      obj.title = current.title;
      obj.genreId = current.genre._id;
      //const tmp = current.numberInStock -1;
      const tmp = current.numberInStock;
      obj.numberInStock = tmp.toString();
      obj.dailyRentalRate = current.dailyRentalRate;

      await saveMovie(obj);
      console.log('obj',obj);

      //this.setState({ movies });
    })

  }

  handleIncrement = async (movie) => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movies[index] };
    movies[index].numberOutStock +=1;
    this.setState({ movies });
  }

  handleDecrement = async (movie) => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movies[index] };
    movies[index].numberOutStock -=1;
    this.setState({ movies });
  }

  handleDelete = async (movie) => {
    if (movie.genre.name === "Default") {
      toast.error("Can not delete a default movie.");
      return;
    }

    const originalMovies = this.state.movies;
    const movies = originalMovies.filter((m) => m._id !== movie._id);
    this.setState({ movies });

    try {
      await deleteMovie(movie._id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("This movie has already been deleted.");

      this.setState({ movies: originalMovies });
    }
  };

  handleLike = (movie) => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movies[index] };
    movies[index].liked = !movies[index].liked;
    this.setState({ movies });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  handleGenreSelect = (genre) => {
    this.setState({ selectedGenre: genre, searchQuery: "", currentPage: 1 });
  };

  handleSearch = (query) => {
    this.setState({ searchQuery: query, selectedGenre: null, currentPage: 1 });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      selectedGenre,
      searchQuery,
      movies: allMovies,
    } = this.state;

    let filtered = allMovies;
    if (searchQuery)
      filtered = allMovies.filter((m) =>
        m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else if (selectedGenre && selectedGenre._id)
      filtered = allMovies.filter((m) => m.genre._id === selectedGenre._id);

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const movies = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: movies };
  };

  render() {
    const { length: count } = this.state.movies;
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    if (count === 0) return <p>There are no movies in the database.</p>;

    const { totalCount, data: movies } = this.getPagedData();

    return (
      <div className="row">
        <div className="col-3">
          <ListGroup
            items={this.state.genres}
            selectedItem={this.state.selectedGenre}
            onItemSelect={this.handleGenreSelect}
          />
        </div>
        <div className="col">
          {user && user.isAdmin && (
            <Link
              to="/movies/new"
              className="btn btn-primary"
              style={{ marginBottom: 20 }}
            >
              New Movie
            </Link>
          )}
          {user && !user.isAdmin && (
            <Link
              to="/customers"
              onClick={() => this.handleCheckout(user)}
              className="btn btn-danger"
              style={{ marginBottom: 20 }}
            >
              Checkout
            </Link>
          )}
          <p>
            Showing <strong>{totalCount}</strong> items in the database.
          </p>
          <SearchBox value={searchQuery} onChange={this.handleSearch} />
          <MoviesTable
            user={user}
            movies={movies}
            sortColumn={sortColumn}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
            onIncrement={this.handleIncrement}
            onDecrement={this.handleDecrement}
          />
          <Pagination
            itemsCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default Movies;
