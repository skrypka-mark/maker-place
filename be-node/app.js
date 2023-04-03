	const express = require('express')
	const app = express()
	const db = require("./database.js")
	const bcrypt = require('bcrypt')
	const session = require('express-session')

	app.set('view engine', 'ejs')
	app.use('/bootstrap',express.static( __dirname+'/node_modules/bootstrap/dist'))
	app.use('/jquery',express.static( __dirname+'/node_modules/jquery/dist/'))
	app.use('/images',express.static( __dirname+'/views/images/'))
	app.use('/user_images',express.static( __dirname+'/views/user_images/'))
	app.use('/css',express.static( __dirname+'/views/css/'))
	app.use(session ({ secret:'randomly generated secret'}))
	app.use(express.urlencoded())
	app.use(setCurrentUser)

	app.get('/', function(req,res)
	{
		res.render('index', {activePage: "home"})
	})


	app.get('/news', function (req, res) 
	{
/* 		var sql = "SELECT orders.title, orders.material, orders.comment, users. name FROM orders LEFT JOIN users ON orders.author_id = users.id ORDER BY timestamp DESC WHERE status = 1"
		db.all(sql, [], (err, rows) => 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.render('orders', {activePage: "orders", orders: rows})
		}); */
		
		res.render('news', {activePage: "news"})
	})



	app.get ( '/place_order' , function ( req , res ) 
	{
		res. render ( 'place_order' , { activePage : "place_order" })
	})

 
	app.get('/orders', function (req, res) 
	{
		var sql = "SELECT orders.order_id, orders.title, orders.material, orders.layer, orders.infill, orders.price,  users.username, users.id, users.avatar FROM orders LEFT JOIN users ON orders.author_id = users.id WHERE orders.state = 1 ORDER BY timestamp DESC"
		db.all(sql, [], (err, rows) => 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.render('orders', {activePage: "orders", orders: rows})
		});
	})
	
	
	
	app.get('/my_orders', function (req, res) 
	{
		if(res.locals.currentUser.status == 2)
		{
			var sql = "SELECT orders.order_id, orders.title, orders.material, orders.layer, orders.infill, orders.price,  users.username, users.id, users.avatar FROM orders LEFT JOIN users ON orders.author_id = users.id WHERE orders.maker_id = ? ORDER BY timestamp DESC"
		}
		if(res.locals.currentUser.status == 1)
		{
			var sql = "SELECT orders.order_id, orders.title, orders.material, orders.layer, orders.infill, orders.price,  users.username, users.id, users.avatar FROM orders LEFT JOIN users ON orders.maker_id = users.id WHERE orders.author_id = ? ORDER BY timestamp DESC"
		}
		//var params = [req.params.id]
		var params = res.locals.currentUser.id
		db.all(sql, params, [], (err, rows) => 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.render('my_orders', {activePage: "my_orders", orders: rows})
		});
	})
	
	
	
	app.get('/community', function (req, res) 
	{
		var sql = "SELECT * FROM users"
		db.all(sql, [], (err, rows) => 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.render('community', {activePage: "community", users: rows})
		});
	})
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	
	app.get('/order/:id', function (req, res) 
	{
		var sql_o = "SELECT * FROM orders LEFT JOIN users ON orders.author_id = users.id WHERE order_id = ?"
		var params = [req.params.id]
		db.get(sql_o, params, (err, row_o) => 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			var sql_c = "SELECT * FROM comments LEFT JOIN users ON comments.commentator_id = users.id WHERE comments.order_id = ?"
			db.all(sql_c,params, [], (err, rows_c) => 
			{
				if (err) 
				{
					res.status(400)
					res.send("database error:" + err.message)
					return;
				}
				res.render('order', {activePage: "orders", comments: rows_c, orders: row_o})
			});
			
		});
		
	})
	
	
		app.get('/order/:id/edit', function (req, res) 
	{
		var sql = "SELECT * FROM orders WHERE id = ?"
		var params = [req.params.id]
		db.get(sql, params, (err, row) => 
		{
			if (err) 
				{
					res.status(400)
					res.send("database error:" + err.message)
					return;
				}
			if (req.session.userId !== row.author_id) 
				{
					res.status(400)
					res.send("database error: mind your own buisness")
					return;
				}
			res.render('edit_order', {order: row, activePage: "my_profile"})
		});
	})
	
	
	app.post('/order/:id/comment', function (req, res) 
	{
		var data = 
		[
			req.session.userId,
			req.body.comment,
			req.params.id,
			Date.now()/1000|0
		]

		var sql = "INSERT INTO comments (commentator_id, comment, order_id, timestamp) VALUES (?,?,?,?)"
		db.run(sql, data, function (err, result) 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.redirect('/order/'+req.params.id)
		});
	})
	
	
	
	app.post('/place_order', function (req, res) 
	{
		var data = 
		[
			Date.now()/1000|0,
			req.body.title,
			req.session.userId,
			req.body.link,
			req.body.material,
			req.body.layer,
			req.body.infill,
			req.body.price,
			req.body.copies,
			req.body.comment
		]

		var sql = "INSERT INTO orders (state, timestamp, title, author_id , file_adr , material, layer, infill, price, copies, comment) VALUES (1,?,?,?,?,?,?,?,?,?,?)"
		db.run(sql, data, function (err, result) 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.redirect('/my_orders')
		});
	})

	
	
	app.post('/profile/:id/feedbacks/leave_feedback', function (req, res) 
	{
		var params = [req.params.id]
		var data = 
		[
			req.session.userId,
			req.body.rating,
			req.body.feedback,
			Date.now()/1000|0,
			req.params.id
		]

		var sql = "INSERT INTO feedbacks (author_id, rating, feedback, timestamp, user_id) VALUES (?,?,?,?,?)"
		db.run(sql, data, function (err, result) 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			var sql2 = "SELECT AVG(rating) AS AVG FROM feedbacks WHERE user_id =?"
			db.get(sql2, params, (err, avg) => 
			{
				if (err) 
				{
					res.status(400)
					res.send("database error:" + err.message)
					return;
				}
				var upd =
					 [
						avg.AVG,
						req.params.id
					 ]
			
				db.run(
					  `UPDATE users SET 
					  rating = ? 
					  WHERE id = ?`, upd,
				function(err,result)
						{
							if(err){
							res.status(400)
							res.send("database error:" + err.message)
							return;
						}
							res.redirect('/profile/'+params+'/feedbacks')
				});
			});
		});
	})
	
	
	 app.get('/profile/:id/feedbacks/leave_feedback',function(req,res)
 {
	var sql = "SELECT * FROM users WHERE id = ?"
	var params = [req.params.id]
	db.get(sql, params, (err, user) => 
	{
		if (err) 
		{
			res.status(400)
			res.send("database error:" + err.message)
			return;
		}
			
		    res.render('leave_feedback' , {activePage : "feedbacks", user:user })
	});

 })
 
 
 
 
 app.get('/take_order/:id',function(req,res)
 {
	var data =
     [
		req.session.userId,
		req.params.id
     ]
	db.run(`UPDATE orders SET 
			state = 2,
			maker_id = ?
		    WHERE order_id = ?`, data,
		function(err,result)
		{
			if(err)
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.redirect('/my_orders')
		});
 })
 
 
 
  app.get('/drop_order/:id',function(req,res)
 {
	var data = [req.params.id]
	db.run(`UPDATE orders SET 
			state = 1,
			maker_id = NULL
		    WHERE order_id = ?`, data,
		function(err,result)
		{
			if(err)
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.redirect('/my_orders')
		});
 })
 
 
 app.get('/complete_order/:id',function(req,res)
 {
	var data = [req.params.id]
	db.run(`UPDATE orders SET 
			state = 3,
		    WHERE order_id = ?`, data,
		function(err,result)
		{
			if(err)
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.redirect('/my_orders')
		});
 })
 
 
  app.get('/remove_order/:id',function(req,res)
 {
	var data = [req.params.id]
	db.run(`DELETE FROM orders WHERE order_id = ?`, data,
		function(err,result)
		{
			if(err)
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}
			res.redirect('/my_orders')
		});
 })
	
	
	app.get('/sign_up',function(req,res)
 {
   res.render('sign_up' , {activePage : "sign_up"})
 })
 
 
 	app.get('/faq',function(req,res)
 {
   res.render('faq' , {activePage : "faq"})
 })
 
 
 	app.get('/sign_up_maker',function(req,res)
 {
   res.render('sign_up_maker' , {activePage : "sign_up"})
 })


	app.get('/sign_up_customer',function(req,res)
 {
   res.render('sign_up_customer' , {activePage : "sign_up"})
 })


 app.get('/login',function(req,res)
 {
   res.render('login' , {activePage : "login", error: ""})
 })

 
  app. get ( '/profile/:id' , checkAuth , function ( req , res )
 {
	var sql = "SELECT * FROM users WHERE id = ?"
	var params = [req.params.id]
	db.get(sql, params, (err, user) => 
	{
		if (err) 
		{
			res.status(400)
			res.send("database error:" + err.message)
			return;
		}
			
		 res. render ( 'profile' , { activePage : "profile", user:user })
	});
  
 })
 
 
 
   app. get ( '/profile/:id/feedbacks' , checkAuth , function ( req , res )
 {
	var sql_u = "SELECT * FROM users WHERE id = ?"
	var params = [req.params.id]
	db.get(sql_u, params, (err, user) => 
	{
		if (err) 
		{
			res.status(400)
			res.send("database error:" + err.message)
			return;
		}
		var sql_f = "SELECT users.username, users.avatar, feedbacks.timestamp, feedbacks.rating, feedbacks.feedback FROM feedbacks LEFT JOIN users ON feedbacks.author_id = users.id WHERE feedbacks.user_id = ?"
		db.all(sql_f,params, [], (err, fbks) => 
		{
			if (err) 
			{
				res.status(400)
				res.send("database error:" + err.message)
				return;
			}

			res.render('feedbacks', {activePage: "feedbacks", feedbacks: fbks, user:user })		
		});
		
	});
	
 })
 
 
   app. get ( '/profile/:id/orders' , checkAuth , function ( req , res )
 {
	var sql = "SELECT * FROM users WHERE id = ?"
	var params = [req.params.id]
	db.get(sql, params, (err, user) => 
	{
		if (err) 
		{
			res.status(400)
			res.send("database error:" + err.message)
			return;
		}
			
		 res. render ( 'profile' , { activePage : "profile", user:user })
	});
  
 })
 
 
 
  app. get ( '/edit_profile' , checkAuth , function ( req , res )
 {
   res. render ( 'edit_profile' , { activePage : "my_profile" })
 })

 app.get('/logout',function(req,res)
 {
 req.session.userId = null
 req.session.loggedIn = false
 res.redirect("/")
 })

  function setCurrentUser ( req , res , next )
  {
    if(req.session.loggedIn) 
	{
      var sql="SELECT * FROM users WHERE id = ?"
      var params=[req.session.userId]
      db.get(sql,params,(err,row) => {
        if(row !== undefined){
          res.locals.currentUser = row
        }
        return next()
      });
    }else{
      return next()
    }
  }

 function checkAuth(req,res,next)
 {
   if(req.session.loggedIn) {
     return next ()
   } else {
     res.redirect('/login')
   }
 }






  app.post('/login',function(req,res)
  {
    var sql="SELECT * FROM users WHERE email = ?"
    var params=[req.body.email]

    var error = ""

    db.get(sql,params,(err,row) => {
      if(err){
        error=err.message
      }
      if(row===undefined){
        error="Wrong email or password"
      }
      if(error!==""){
        res.render('login',{activePage:"login",error:error})
        return
      }

      bcrypt.compare(req.body.password,row["password"],function(err,hashRes){
        if(hashRes===false){
          error = "Wrong email or password"
          var data =[row["id"]]
          res.render('login',{activePage:"login",error:error})
          //console.log(row['failed_logins'])
          return;
        }
        var data =[row["id"]]
        req.session.userId=row["id"]
        req.session.loggedIn = true
        res.redirect("/")
      });
    })
  })




 app.post ('/sign_up_customer',function(req,res)
 {
   bcrypt.hash(req.body.password,10,function(err,hash){
	 var default_ava = "default.png"
     var data =
     [
		req.body.username,
		req.body.email,
		req.body.country,
		req.body.city,
		hash,
		default_ava
     ]
     var sql="INSERT INTO users ( rating, orders, gramms, status, username, email, country, city, password, avatar) VALUES (0,0,0,1,?,?,?,?,?,?)"
     db.run(sql,data,function(err,result){
       if(err){
         res.status(400)
         res.send("database error:"+err.message)
         return;
       }
       res.render('sign_up_answer',{activePage:"sign_up", formData:req.body})
     });
   });
})



 app.post ('/sign_up_maker',function(req,res)
 {
   bcrypt.hash(req.body.password,10,function(err,hash){
	 var default_ava = "default.png"
     var data =
     [
		req.body.username,
		req.body.email,
		req.body.phone_num,
		req.body.card_num,
		req.body.country,
		req.body.city,
		hash,
		default_ava
     ]
     var sql="INSERT INTO users ( rating, orders, gramms, status, username, email, phone_num, card_num, country, city, password,avatar) VALUES (0,0,0,2,?,?,?,?,?,?,?,?)"
     db.run(sql,data,function(err,result){
       if(err){
         res.status(400)
         res.send("database error:"+err.message)
         return;
       }
       res.render('sign_up_answer',{activePage:"sign_up", formData:req.body})
     });
   });
})


 app.post ('/edit_profile',function(req,res)
 {
   bcrypt.hash(req.body.password,10,function(err,hash){
     var data =
     [
		req.body.username,
		req.body.email,
		req.body.phone_num,
		req.body.card_num,
		req.body.country,
		req.body.city,
		req.body.avatar,
		req.body.links,
		req.body.about,
		req.body.printers,
		req.session.userId
     ]
    
    db.run(
      `UPDATE users SET 
	  username = COALESCE(?,username), 
	  email = COALESCE(?,email),
	  phone_num = COALESCE(?,phone_num),
	  card_num = COALESCE(?,card_num),
	  country = COALESCE(?,country),
	  city = COALESCE(?,city),
	  avatar = COALESCE(?,avatar),
	  links = COALESCE(?,links),
	  about = COALESCE(?,about),
	  printers = COALESCE(?,printers)
	  WHERE id = ?`, data,
      function(err,result)
		{
			if(err){
			res.status(400)
			res.send("database error:" + err.message)
			return;
        }
        res.redirect('/profile/'+ req.session.userId)
     });
   });
})


app.listen(3000)
