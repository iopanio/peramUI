import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import { getItem, saveItem } from "../services/itemService";
import { getGenres } from "../services/genreService";

class ItemForm extends Form {
  state = {
    data: {
      title: "",
      genreId: "",
      numberInStock: "",
      dailyRentalRate: "",
    },
    genres: [],
    errors: {},
  };

  schema = {
    _id: Joi.string(),
    title: Joi.string().required().label("Title"),
    genreId: Joi.string().required().label("Genre"),
    numberInStock: Joi.number()
      .required()
      .min(0)
      .max(100)
      .label("Number in Stock"),
    dailyRentalRate: Joi.string().required().label("Title")
  };

  async populateGenres() {
    const { data: genres } = await getGenres();
    this.setState({ genres });
  }

  async populateItem() {
    try {
      const itemId = this.props.match.params.id;
      if (itemId === "new") return;

      const { data: item } = await getItem(itemId);
      this.setState({ data: this.mapToViewModel(item) });
    } catch (ex) {
      if (ex.response && ex.response.status === 404)
        this.props.history.replace("/not-found");
    }
  }

  async componentDidMount() {
    await this.populateGenres();
    await this.populateItem();
  }

  mapToViewModel(item) {
    return {
      _id: item._id,
      title: item.title,
      genreId: item.genre._id,
      numberInStock: item.numberInStock,
      dailyRentalRate: item.dailyRentalRate,
    };
  }

  doSubmit = async () => {
    await saveItem(this.state.data);
    console.log('onsubmit: ', this.state.data);
    // onsubmit:  {_id: '63aa54860f62a91a1b1ec4ab', title: 'Actuator', genreId: '63aa54860f62a91a1b1ec4a9', numberInStock: '7', dailyRentalRate: 'lorem ipsum'}
    this.props.history.push("/items");
  };

  render() {
    return (
      <div>
        <h1>Item Form</h1>

        <form onSubmit={this.handleSubmit}>
          {this.renderInput("title", "Title")}
          {this.renderSelect("genreId", "Genre", this.state.genres)}
          {this.renderInput("numberInStock", "Number in Stock", "number")}
          {this.renderInput("dailyRentalRate", "Rate")}
          {this.renderButton("Save")}
        </form>
      </div>
    );
  }
}

export default ItemForm;
