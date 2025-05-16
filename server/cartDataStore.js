import sqlite3 from 'sqlite3';
const { verbose } = sqlite3;

const db = new (verbose().Database)('cart.db', (error) => {
    if (error) {
        console.error(error.message);
    }
    console.log('Connected to the cart database.');
});

function initDatabase() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL
            )
        `);

        const stmt = db.prepare(`INSERT INTO cart (user_id, name, quantity, unit_price) VALUES (?, ?, ?, ?)`);
    
        stmt.run('user123', 'Book', 5, 4.29);
        stmt.run('user123', 'Pen', 2, 2.99); 
        stmt.run('user123', 'Bag', 1, 50.00);

        stmt.run('user1234', 'Apple', 3, 1.99);
        stmt.run('user1234', 'Mango', 4, 3.49); 
        stmt.run('user1234', 'Orange', 5, 2.29);
        
        stmt.finalize();
    });
}

function addToCart(user_id, name, quantity, unit_price) {
    if (!name || name.trim() === '') {
        const error = new Error('Item name cannot be empty');
        error.status = 400;
        throw error;
    }
    
    if (quantity <= 0) {
        const error = new Error('Quantity must be positive');
        error.status = 400;
        throw error;
    }
    
    if (unit_price < 0) {
        const error = new Error('Price cannot be negative');
        error.status = 400;
        throw error;
    }
    
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO cart (user_id, name, quantity, unit_price)
            VALUES (?, ?, ?, ?)`, 
            [user_id, name, quantity, unit_price], 
            (error) => {
                if (error) {
                    console.error(error.message);
                    reject(error);
                }
                resolve();
            }
        );
    });
}

function listCartContents(user_id) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM cart WHERE user_id = ?`, [user_id], (err, rows) => {
        if (err) return reject(err);
        const total = rows.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
        resolve({ items: rows, total });
      });
    });
  }  

  function getOneItem(user_id, name) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM cart WHERE user_id = ? AND name = ?`, [user_id, name], (err, rows) => {
            if (err) return reject(err);
            resolve({ items: rows });
        })
    }) 
  }

  async function updateItemQuantity(user_id, name, quantity) {
    const exists = await checkItemExists(user_id, name);
    if (!exists) {
        const error = new Error('Item not found');
        error.status = 404;
        throw error;
    }
    
    if (quantity < 0) {
        const error = new Error('Quantity must be non-negative');
        error.status = 400;
        throw error;
    }
    
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE cart SET quantity = ? WHERE user_id = ? AND name = ?`, 
            [quantity, user_id, name], 
            function(error) {
                if (error) {
                    console.error(error.message);
                    reject(error);
                }
                resolve();
            }
        );
    });
}

async function removeItem(user_id, name) {
    const exists = await checkItemExists(user_id, name);
    if (!exists) {
        const error = new Error('Item not found');
        error.status = 404;
        throw error;
    }
    
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM cart WHERE user_id = ? AND name = ?`, 
            [user_id, name], 
            function(error) {
                if (error) {
                    console.error(error.message);
                    reject(error);
                }
                resolve();
            }
        );
    });
}

function clearCart(user_id) {
    return new Promise((resolve, reject) => {
        db.run(`
        DELETE FROM cart WHERE user_id = ?
    `, [user_id], (error) => {
        if (error) {
            console.error(error.message);
            reject(error);
        }
        resolve();
    });
    });
}

function checkItemExists(user_id, name) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) as count FROM cart WHERE user_id = ? AND name = ?`, 
            [user_id, name], 
            (err, row) => {
                if (err) return reject(err);
                resolve(row.count > 0);
            }
        );
    });
}

export {
    initDatabase,
    addToCart,
    listCartContents,
    updateItemQuantity,
    removeItem,
    clearCart,
    getOneItem
};