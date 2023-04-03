 var sqlite3 = require('sqlite3').verbose()
 var DBSOURCE="./db/db.sqlite"
 var db=new sqlite3.Database(DBSOURCE,(err)=>
 {
	if(err)
	{
		console.error(err.message)
		throw err
	}
	else
	{
		console.log('Connected to the SQLite database.')



		db.run( `CREATE TABLE users 
				(
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					username TEXT UNIQUE,
					email TEXT UNIQUE,
					phone_num TEXT,
					card_num TEXT,
					password TEXT,
					avatar TEXT,
					about TEXT,
					links TEXT,
					status INTEGER,
					country TEXT,
					city TEXT,
					printers TEXT,
					rating INTEGER,
					orders INTEGER,
					gramms INTEGER,
					CONSTRAINT email_unique UNIQUE (email)
					CONSTRAINT username_unique UNIQUE (username)
				) `,
			(err)=>
				{
					if(err)
					{
							console.log("Table users is already created:" + err.message)
					}
					else
					{
						console.log("Table users is created")
					}
				});



		db.run(`CREATE TABLE orders 
					(
						order_id INTEGER PRIMARY KEY AUTOINCREMENT,
						state INTEGER,
						timestamp INTEGER,
						title TEXT,
						author_id INTEGER,
						maker_id INTEGER,
						file_adr TEXT,
						material TEXT,
						layer REAL,
						infill INTEGER,
						price REAL,
						copies INTEGER,
						comment TEXT,
						FOREIGN KEY(author_id) REFERENCES users(id)
						FOREIGN KEY(maker_id) REFERENCES users(id)
					)`,
		(err)=>
		{
			if(err)
			{
				console.log("Table orders is already created:" + err.message)
			}
			else
			{
				console.log("Table orders is created")
			}
		});
		
		
		/* db.run(`CREATE TABLE images 
					(
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						image_author_id INTEGER,
						file_adr TEXT,
						comment TEXT,
						timestamp INTEGER,
						FOREIGN KEY(image_author_id) REFERENCES users(id)
					)`,
		(err)=>
		{
			if(err)
			{
				console.log("Table images is already created:" + err.message)
			}
			else
			{
				console.log("Table images is created")
			}
		}); 
		
		
		db.run(`CREATE TABLE news 
					(
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						timestamp INTEGER,
						title TEXT,
						body TEXT
					)`,
		(err)=>
		{
			if(err)
			{
				console.log("Table news is already created:" + err.message)
			}else
			{
				console.log("Table news is created")
			}
		});
		
		
		db.run(`CREATE TABLE messages 
					(
						 message_id INTEGER PRIMARY KEY AUTOINCREMENT,
						 message_author_id INTEGER,
						 message_user_id INTEGER,
						 message text,
						FOREIGN KEY(user_id) REFERENCES users(id)
						FOREIGN KEY(author_id) REFERENCES users(id)
					)`,
		(err)=>
		{
			if(err)
			{
				console.log("Table  messages is already created:" + err.message)
			}else
			{
				console.log("Table  messages is created")
			}
		});*/
		
		db.run(`CREATE TABLE comments 
					(
						comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
						timestamp INTEGER,
						commentator_id INTEGER,
						comment TEXT,
						order_id INTEGER,
						FOREIGN KEY(order_id) REFERENCES orders(id)
					)`,
		(err)=>
		{
			if(err)
			{
				console.log("Table comments is already created:" + err.message)
			}
			else
			{
				console.log("Table comments is created")
			}
		});
		
		
				db.run(`CREATE TABLE feedbacks 
					(
						feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
						timestamp INTEGER,
						author_id INTEGER,
						user_id INTEGER,
						rating INTEGER,
						feedback TEXT,
						FOREIGN KEY(user_id) REFERENCES users(id),
						FOREIGN KEY(author_id) REFERENCES users(id)
						CONSTRAINT author_user_unique UNIQUE (user_id, author_id)
					)`,
		(err)=>
		{
			if(err)
			{
				console.log("Table feedbacks is already created:" + err.message)
			}
			else
			{
				console.log("Table feedbacks is created")
			}
		});
	}
});
 module. exports = db
