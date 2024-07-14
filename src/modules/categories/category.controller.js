import Category from "../../../DB/models/category.model.js";
// Create a new category
export let createCategory = async (req, res, next) => {
    let { categoryName } = req.body;
    let { _id } = req.authUser;

    // Check if the category already exists for the user
    let checkCategory = await Category.findOne({ categoryName, userId: _id });
    if (checkCategory) {
        return next(new Error("You Added This Category before", { cause: 409 }));
    }

    // Create the category
    let createCategory = await Category.create({ categoryName, userId: _id });
    if (!createCategory) {
        return next(new Error("Creation Failed", { cause: 409 }));
    }

    // Return success message and the created category
    return res.status(201).json({
        message: 'Category Added successfully',
        createCategory 
    });
};


// Get all categories for a user
export let getCategories = async (req, res, next) => {
    let { _id } = req.authUser;

    // Find all categories belonging to the user
    let getAllCategories = await Category.find({ userId: _id });    
    if (!getAllCategories) {
        return next(new Error("No Categories Found For This User", { cause: 409 }));
    }

    // Return success message and all categories
    return res.status(200).json({
        message: 'Success',
        getAllCategories 
    });
};

// Update a category
export let updateCategory = async (req, res, next) => {
    let { categoryId } = req.params;
    let { categoryName } = req.body;

    // Find the category by ID
    let category = await Category.findById(categoryId);
    if (!category) {
        return next(new Error("Category not found", { cause: 404 }));
    }

    // Check if the user is authorized to update this category
    if (category.userId.toString() !== req.authUser._id.toString()) {
        return next(new Error("Unauthorized to update this category", { cause: 403 }));
    }

    // Update the category name and save
    category.categoryName = categoryName;
    await category.save();

    // Return success message and the updated category
    res.status(200).json({
        message: 'Category updated successfully',
        category 
    });
};

// Delete a category
export let deleteCategory = async (req, res, next) => {
    let { categoryId } = req.params;
    let userId = req.authUser._id;

    // Find and delete the category
    let category = await Category.findOneAndDelete({ _id: categoryId, userId });
    if (!category) {
        return next(new Error("Category not found or unauthorized", { cause: 404 }));
    }

    // Return success message
    res.status(200).json({
        message: 'Category deleted successfully'
    });
};
