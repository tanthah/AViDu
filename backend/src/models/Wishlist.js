// backend/src/models/Wishlist.js
import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      unique: true
    },
    
    products: [{
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product",
        required: true
      },
      addedAt: { 
        type: Date, 
        default: Date.now 
      }
    }]
  },
  { timestamps: true }
);

// Method: Add product to wishlist
wishlistSchema.methods.addProduct = function(productId) {
  const exists = this.products.some(
    p => p.productId.toString() === productId.toString()
  );
  
  if (exists) {
    throw new Error('Sản phẩm đã có trong danh sách yêu thích');
  }
  
  this.products.push({ productId });
  return this.save();
};

// Method: Remove product from wishlist
wishlistSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(
    p => p.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Method: Check if product is in wishlist
wishlistSchema.methods.hasProduct = function(productId) {
  return this.products.some(
    p => p.productId.toString() === productId.toString()
  );
};

export default mongoose.model("Wishlist", wishlistSchema);

// backend/src/models/ViewedProduct.js
const viewedProductSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true
    },
    
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product",
      required: true
    },
    
    viewCount: { 
      type: Number, 
      default: 1 
    },
    
    lastViewedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Compound index
viewedProductSchema.index({ userId: 1, productId: 1 }, { unique: true });
viewedProductSchema.index({ userId: 1, lastViewedAt: -1 });

// Static method: Track product view
viewedProductSchema.statics.trackView = async function(userId, productId) {
  const viewed = await this.findOne({ userId, productId });
  
  if (viewed) {
    viewed.viewCount += 1;
    viewed.lastViewedAt = new Date();
    return viewed.save();
  } else {
    return this.create({ userId, productId });
  }
};

export const ViewedProduct = mongoose.model("ViewedProduct", viewedProductSchema);