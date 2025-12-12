// script.js - Sistema de carrinho + reserva + WhatsApp

const PHONE_WHATSAPP = "5584981045602";

// Carrega carrinho (mantém entre páginas)
let cart = JSON.parse(localStorage.getItem("cartJJ") || "[]");

// Salvar
function saveCart() {
    localStorage.setItem("cartJJ", JSON.stringify(cart));
}

// =========================
// ADICIONAR PASSEIOS
// =========================

// Função usada em passeios-a.html
function selecionarPasseio(nome, preco) {
    const id = nome.toLowerCase().replace(/\s+/g, '');
    
    const tour = {
        id,
        title: nome,
        price: preco,
        duration: "",
        preservation: 0,
        cardFee: 0,
        times: [],
        quantity: 1,
        names: "",
        chosenTime: ""
    };

    addToCart(tour);
    alert("Passeio adicionado à reserva!");
}

// Função geral do script
function addToCart(tour) {
    if (cart.find(c => c.id === tour.id)) {
        alert("Este passeio já foi adicionado.");
        return;
    }

    cart.push({
        ...tour,
        quantity: 1,
        names: "",
        chosenTime: tour.times?.[0] || ""
    });

    saveCart();
    renderCart();
}

// =========================
// REMOÇÃO / ALTERAÇÃO
// =========================
function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    saveCart();
    renderCart();
}

function changeQuantity(id, q) {
    const it = cart.find(c => c.id === id);
    if (!it) return;
    it.quantity = Math.max(1, Number(q) || 1);
    saveCart();
    renderCart();
}

function changeNames(id, names) {
    const it = cart.find(c => c.id === id);
    if (!it) return;
    it.names = names;
    saveCart();
}

function changeTime(id, time) {
    const it = cart.find(c => c.id === id);
    if (!it) return;
    it.chosenTime = time;
    saveCart();
}

// =========================
// CÁLCULOS
// =========================
function calculateTotals() {
    let subtotal = 0, preservation = 0, cardFees = 0;

    cart.forEach(it => {
        subtotal += it.price * it.quantity;
        preservation += (it.preservation || 10) * it.quantity;
        cardFees += (it.cardFee || 5) * it.quantity;
    });

    return {
        subtotal,
        preservation,
        cardFees,
        total: subtotal + preservation + cardFees
    };
}

// =========================
// RENDERIZAR CARRINHO (reserva.html)
// =========================
function renderCart() {
    const el = document.getElementById("cart");
    if (!el) return;

    el.innerHTML = "";

    if (cart.length === 0) {
        el.innerHTML = `<div class="summary"><strong>Nenhum passeio selecionado.</strong></div>`;
        return;
    }

    cart.forEach(it => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
          <h3>${it.title}</h3>
          <p class="small">Valor: R$ ${it.price.toFixed(2)}</p>

          <div class="form-row">
            <input class="input" placeholder="Nomes" value="${it.names}"
                   onchange="changeNames('${it.id}', this.value)">
            <input class="input" type="number" min="1" value="${it.quantity}"
                   onchange="changeQuantity('${it.id}', this.value)" style="width:110px">
          </div>

          ${it.times && it.times.length > 0 ? `
            <select class="input" onchange="changeTime('${it.id}', this.value)">
                ${it.times.map(t => `<option value="${t}">${t}</option>`).join("")}
            </select>` : ''}

          <button class="btn" style="margin-top:10px" onclick="removeFromCart('${it.id}')">Remover</button>
        `;

        el.appendChild(card);
    });

    const totals = calculateTotals();

    const sum = document.createElement("div");
    sum.className = "summary";

    sum.innerHTML = `
        <div class="flex-between"><span>Preservação</span><span>R$ ${totals.preservation.toFixed(2)}</span></div>
        <div class="flex-between"><span>Taxa maquininha</span><span>R$ ${totals.cardFees.toFixed(2)}</span></div>

        <hr>

        <div class="flex-between" style="font-weight:bold">
            <span>Total geral</span><span>R$ ${totals.total.toFixed(2)}</span>
        </div>

        <button class="btn" style="margin-top:10px" onclick="finalizeWhatsApp()">Enviar para WhatsApp</button>
    `;

    el.appendChild(sum);
}

// =========================
// WHATSAPP
// =========================
function finalizeWhatsApp() {
    if (cart.length === 0) {
        alert("Nenhum passeio selecionado.");
        return;
    }

    let msg = `Olá! Gostaria de reservar:\n`;

    cart.forEach(it => {
        msg += `\n• ${it.title}\n`;
        msg += `  Quantidade: ${it.quantity}\n`;
        msg += `  Horário: ${it.chosenTime || "-"}\n`;
        msg += `  Nomes: ${it.names || "-"}\n`;
    });

    const totals = calculateTotals();

    msg += `\nTotal geral: R$ ${totals.total.toFixed(2)}`;
    msg += `\nAguardo confirmação da disponibilidade.`;

    const url = `https://wa.me/${5584991694313}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}

// =========================
// INICIALIZAÇÃO
// =========================
window.addEventListener("DOMContentLoaded", () => {
    renderCart();
});
