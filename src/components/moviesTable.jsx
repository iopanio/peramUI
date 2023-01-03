import React, { Component } from "react";
import auth from "../services/authService";
import { Link } from "react-router-dom";
import Table from "./common/table";
import Like from "./common/like";
import Counter from "./common/counter";

class MoviesTable extends Component {
  columns = [
    {
      path: "title",
      label: "Item",
      content: (movie) => (
        <Link to={`/movies/${movie._id}`}>{movie.title}</Link>
      ),
    },
    { path: "genre.name", label: "Category" },
    { path: "numberInStock", label: "Stock In" },
    { path: "dailyRentalRate", label: "Description" },
  ];

  checkoutColumns = [
    {
      label: "My Cart",
      key: "checkout",
      content: (movie) => (
        <div className="row">
          <div className="col-1">
        <span className="badge m-2 badge-warning">{movie.numberOutStock}</span>
          </div>
          <div className="col">
            <button
              onClick={() => this.props.onIncrement(movie)}
              className="btn btn-secondary btn-sm"
              disabled={movie.numberInStock === 0 ? "disabled" : ""}
            >
              +
            </button>
            <button
              onClick={() => this.props.onDecrement(movie)}
              className="btn btn-secondary btn-sm m-2"
              disabled={movie.numberOutStock > movie.numberInStock
                        || movie.numberOutStock < 1
                        ? "disabled" : ""}
            >
              -
            </button>
          </div>
        </div>
      )
    }
  ];

  likedColumns = [
    {
      key: "like",
      content: (movie) => (
        <Like liked={movie.liked} onClick={() => this.props.onLike(movie)} />
      ),
    }
  ];

  deletedColumns = [
    {
      key: "delete",
      content: (movie) => (
        <button
          onClick={() => this.props.onDelete(movie)}
          className="btn btn-danger btn-sm"
        >
          Delete
        </button>
      ),
    },
  ];

  constructor() {
    super();
    const user = auth.getCurrentUser();
    if (user && user.isAdmin)
      this.columns = this.columns.concat(this.deletedColumns);

    if (user && !user.isAdmin) {
      this.columns = this.columns.concat(this.checkoutColumns);
      this.columns[0].content = null;
    }
  }

  render() {
    const { user, movies, onSort, sortColumn } = this.props;

    return (
      <Table
        columns={this.columns}
        data={movies}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default MoviesTable;
