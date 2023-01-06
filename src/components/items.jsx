import React, { Component } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ItemsTable from "./itemsTable";
import ListGroup from "./common/listGroup";
import Pagination from "./common/pagination";
import { getItems, deleteItem, saveItem } from "../services/itemService";
import { getGenres } from "../services/genreService";
import { saveCustomer } from "../services/customerService";
import { paginate } from "../utilities/paginate";
import _ from "lodash";
import SearchBox from "./searchBox";

class Items extends Component {
  state = {
    items: [],
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

    const { data: items } = await getItems();
    this.setState({ items, genres });
  }

  handleCheckout = async (user) =>  {
    const inventory = [...this.state.items];
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

    // update items state numberInStock
    const updates = inventory.map((update) => {
      update.numberInStock = update.numberInStock -update.numberOutStock;
      update.numberOutStock = 0;

      return update;
    });

    updates.forEach(async(current) => {
      //await saveItem(obj);
      const obj = {};
      obj._id = current._id;
      obj.title = current.title;
      obj.genreId = current.genre._id;
      //const tmp = current.numberInStock -1;
      const tmp = current.numberInStock;
      obj.numberInStock = tmp.toString();
      obj.dailyRentalRate = current.dailyRentalRate;

      await saveItem(obj);

      //this.setState({ items });
    })

  }

  handleIncrement = async (item) => {
    const items = [...this.state.items];
    const index = items.indexOf(item);
    items[index] = { ...items[index] };
    items[index].numberOutStock +=1;
    this.setState({ items });
  }

  handleDecrement = async (item) => {
    const items = [...this.state.items];
    const index = items.indexOf(item);
    items[index] = { ...items[index] };
    items[index].numberOutStock -=1;
    this.setState({ items });
  }

  handleDelete = async (item) => {
    if (item.genre.name === "Default") {
      toast.error("Can not delete a default item.");
      return;
    }

    const originalItems = this.state.items;
    const items = originalItems.filter((m) => m._id !== item._id);
    this.setState({ items });

    try {
      await deleteItem(item._id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        toast.error("This item has already been deleted.");

      this.setState({ items: originalItems });
    }
  };

  handleLike = (item) => {
    const items = [...this.state.items];
    const index = items.indexOf(item);
    items[index] = { ...items[index] };
    items[index].liked = !items[index].liked;
    this.setState({ items });
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
      items: allItems,
    } = this.state;

    let filtered = allItems;
    if (searchQuery)
      filtered = allItems.filter((m) =>
        m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else if (selectedGenre && selectedGenre._id)
      filtered = allItems.filter((m) => m.genre._id === selectedGenre._id);

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const items = paginate(sorted, currentPage, pageSize);

    return { totalCount: filtered.length, data: items };
  };

  render() {
    const { length: count } = this.state.items;
    const { pageSize, currentPage, sortColumn, searchQuery } = this.state;
    const { user } = this.props;

    //if (count === 0) return <p>There are no items in the database.</p>;

    const { totalCount, data: items } = this.getPagedData();

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
              to="/items/new"
              className="btn btn-primary"
              style={{ marginBottom: 20 }}
            >
              New Item
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
          <ItemsTable
            user={user}
            items={items}
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

export default Items;
