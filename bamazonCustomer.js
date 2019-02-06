// Pull in required dependencies
var inquirer = require('inquirer');
var mysql = require('mysql');

// Define the MySQL connection parameters
var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,

	// Your username
	user: 'root',

	// Your password
	password: 'T1me2Sch3d!',
	database: 'bamazon_db'
});

// validateInput makes sure that the user is supplying only positive integers for their inputs
function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
}

// promptUserPurchase will prompt the user for the item/quantity they would like to purchase
function promptUser() {
	// console.log('___ENTER promptUserPurchase___');

	// Prompt the user to select an item
	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Enter the Item ID which you would like to buy.',
			validate: validateInput,
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many do you need?',
			validate: validateInput,
			filter: Number
		}
	]).then(function(input) {


		var item = input.item_id;
		var quantity = input.quantity;

		// Query db to confirm that the given item ID exists in the desired quantity
		var queryStr = 'SELECT * FROM products WHERE ?';

		connection.query(queryStr, {item_id: item}, function(err, data) {
            if (err) throw err;
            
			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID');
				displayInventory();

			} else {
				var productData = data[0];


				// If the quantity requested by the user is in stock
				if (quantity <= productData.stock_quantity) {
					console.log('Nice!, product in stock! Placing order!');

					// Construct the updating query string
					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

					// Update the inventory
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('Order has been placed! Your total is $' + productData.price * quantity);
						console.log('Come back soon!');
						console.log("\n---------------------------------------------------------------------\n");

						// End the database connection
						connection.end();
					})
				} else {
					console.log('Bummer, item out of stock :(');
					console.log('Pick another item');
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
				}
			}
		})
	})
}

// checking inventory
function displayInventory() {
	// console.log('___ENTER displayInventory___');

	// swl query
	queryStr = 'SELECT * FROM products';


	connection.query(queryStr, function(err, data) {
		if (err) throw err;

		console.log('Inventory: ');

		var strOut = '';
		for (var i = 0; i < data.length; i++) {
			strOut = '';
			strOut += 'Item ID: ' + data[i].item_id + ' | ';
			strOut += 'Product: ' + data[i].product_name + ' | ';
			strOut += 'Department: ' + data[i].department_name + ' | ';
			strOut += 'Price: $' + data[i].price;

			console.log(strOut);
		}

	  	console.log("---------------------------------------------------------------------\n");

	  	//Prompt the user for item/quantity they would like to purchase
	  	promptUser();
	})
}

// runBamazon will execute the main application logic
function runBamazon() {

	displayInventory();
}

// Run the application logic
runBamazon();