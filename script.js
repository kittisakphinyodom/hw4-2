const STORAGE_KEY = "inventoryProducts";

function getProducts() {
    const products = localStorage.getItem(STORAGE_KEY);
    return products ? JSON.parse(products) : [];
}

function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    loadProducts(); // โหลดข้อมูลใหม่
}

function addProduct() { //1.ฟังก์ชันหลัก
    const id = document.getElementById("productId").value;
    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const inStock = parseInt(document.getElementById("productStock").value);
    const category = document.getElementById("productCategory").value;
    const minStock = parseInt(document.getElementById("productMinStock").value);

    if (!id || !name || isNaN(price) || isNaN(inStock) || !category || isNaN(minStock)) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน!");
        return;
    }

    const products = getProducts();
    if (products.find(p => p.id === id)) {
        alert("สินค้านี้มีอยู่แล้ว!");
        return;
    }

    
    products.push({ id, name, price, inStock, category, minStock, totalSales: 0 });
    saveProducts(products);
    alert("เพิ่มสินค้าเรียบร้อย!");
}



function updateStock(productId, quantity) { //2.ฟังก์ชันหลัก
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return alert("ไม่พบสินค้า!");

    product.inStock += quantity;
    if (product.inStock < 0) product.inStock = 0; // ไม่ให้ติดลบ
    
    
    saveProducts(products);
    checkLowStock(); // เช็กสินค้าหลังอัปเดต
    
}

function loadProducts() { 
    const products = getProducts();
    const tableBody = document.getElementById("productTable");
    tableBody.innerHTML = "";

    products.forEach(product => {
        const row = `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.price} บาท</td>
                <td>${product.inStock}</td>
                <td>${product.category}</td>
                <td>
                    ${product.inStock === 0 
                        ? "❌ หมดแล้ว" 
                        : product.inStock <= product.minStock 
                        ? "⚠️ ใกล้หมด" 
                        : "✅ ปกติ"}
                </td>

                <td>
                    <button class="cus-btn" onclick="updateStock('${product.id}', 1)">+1</button>
                    <button class="cus-btn" onclick="updateStock('${product.id}', -1)">-1</button>
                </td>

                <td>
                
                    <button class="cus-button_edit" onclick="editProduct('${product.id}')">🔧 แก้ไข</button>
                    <button class="cus-button_delete" onclick="deleteProduct('${product.id}')">🗑️ ลบ</button>
                    <button class="cus-button_sell" onclick="sellProduct('${product.id}')">🛒 ขาย</button>
                    
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

function checkLowStock() { //3.ฟังก์ชันหลัก
    const products = getProducts();

    products.forEach(product => {
        if (product.inStock === 0) {
            alert(`❌ สินค้า "${product.name}" หมดแล้ว! กรุณาเติมสต็อก`);
        } else if (product.inStock <= product.minStock) {
             alert(`⚠️ สินค้า "${product.name}" ใกล้หมด เหลือ ${product.inStock} ชิ้น`);
        }
    });

        loadProducts(); 
}

//ฟังก์ชัน (แก้ไข)
function editProduct(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return alert("ไม่พบสินค้า!");

    const newName = prompt("แก้ไขชื่อสินค้า:", product.name);
    const newPrice = parseFloat(prompt("แก้ไขราคา:", product.price));
    const newCategory = prompt("แก้ไขหมวดหมู่:", product.category);

    if (!newName || isNaN(newPrice) || !newCategory) {
        alert("ข้อมูลไม่ถูกต้อง!");
        return;
    }

    product.name = newName;
    product.price = newPrice;
    product.category = newCategory;

    saveProducts(products);
    alert("อัปเดตสินค้าสำเร็จ!");
}


//ฟังก์ชั่น (ลบ)
function deleteProduct(productId) {
    let products = getProducts();
    products = products.filter(p => p.id !== productId);

    saveProducts(products);
    alert("ลบสินค้าเรียบร้อย!");
}

//ฟังก์ชัน (ปุ่มขาย)
function sellProduct(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) return alert("ไม่พบสินค้า!");

    if (product.inStock > 0) {
        product.inStock -= 1;
        product.totalSales = (product.totalSales || 0) + 1; // เพิ่มยอดขาย
        saveProducts(products);
        checkLowStock(); // เช็คว่าสินค้าใกล้หมดหรือไม่
    } else {
        alert(`❌ สินค้า "${product.name}" หมดแล้ว!`);
    }
}


function generateSalesReport() {//4.ฟังก์ชันหลัก
    const products = getProducts();
    
    let report = "--- รายงานยอดขายสินค้า ---\n";
    let totalRevenue = 0;
    let hasSales = false;

    // เรียงลำดับสินค้าขายดี (มาก -> น้อย)
    const sortedProducts = [...products].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0));

    sortedProducts.forEach((p, index) => {
        let totalSales = p.totalSales || 0; // ป้องกัน undefined
        let revenue = totalSales * p.price;
        totalRevenue += revenue;

        if (totalSales > 0) {
            hasSales = true;
            let bestSellerTag = index === 0 ? " 🏆 สินค้าขายดีสุด!" : "";
            report += `- ${p.name}: ขายไป ${totalSales} ชิ้น, รายได้ ${revenue.toLocaleString()} บาท${bestSellerTag}\n`;
        }
    });

    if (!hasSales) {
        report += "❌ ยังไม่มีการขายสินค้า\n";
    }

    report += `💰 รายได้รวม: ${totalRevenue.toLocaleString()} บาท`;
    document.getElementById("salesReport").innerText = report;
}



// โหลดข้อมูลเมื่อเปิดหน้าเว็บ
loadProducts();