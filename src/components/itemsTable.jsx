import React, { Component } from "react";
import auth from "../services/authService";
import { Link } from "react-router-dom";
import Table from "./common/table";
import Like from "./common/like";
import Counter from "./common/counter";

class ItemsTable extends Component {
  columns = [
    {
      path: "title",
      label: "Item",
      content: (item) => (
        <Link to={`/items/${item._id}`}>{item.title}</Link>
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
      content: (item) => (
        <div className="row">
          <div className="col-1">
        <span className="badge m-2 badge-warning">{item.numberOutStock}</span>
          </div>
          <div className="col">
            <button
              onClick={() => this.props.onIncrement(item)}
              className="btn btn-secondary btn-sm"
              disabled={item.numberInStock === 0 ? "disabled" : ""}
            >
              +
            </button>
            <button
              onClick={() => this.props.onDecrement(item)}
              className="btn btn-secondary btn-sm m-2"
              disabled={item.numberOutStock > item.numberInStock
                        || item.numberOutStock < 1
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
      content: (item) => (
        <Like liked={item.liked} onClick={() => this.props.onLike(item)} />
      ),
    }
  ];

  deletedColumns = [
    {
      key: "delete",
      content: (item) => (
        <button
          onClick={() => this.props.onDelete(item)}
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
    const { user, items, onSort, sortColumn } = this.props;

    return (
      <Table
        columns={this.columns}
        data={items}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default ItemsTable;
