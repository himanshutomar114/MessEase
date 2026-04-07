// import Product from "../model/product.model";
import User from "../model/user.model.js";

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: "Product already in wishlist" });
    } else {
      user.wishlist.push(productId);
      await user.save();
      res.status(200).json({
        message: "Product added to wishlist",
        wishlist: user.wishlist,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "error in adding to wishlist", error: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error removing from wishlist" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist" });
  }
};

export default {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
