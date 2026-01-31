const Reservation = require('../models/Reservation');
const Product = require('../models/Product');

/**
 * Check if a product is available for a given date range
 * @param {ObjectId} productId
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {Number} quantity
 * @returns {Promise<Boolean>}
 */
const checkAvailability = async (productId, startDate, endDate, quantityParams) => {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    // Find all active reservations that overlap with the requested dates
    const overlappingReservations = await Reservation.find({
        product: productId,
        status: 'active',
        $or: [
            { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
        ]
    });

    // Calculate maximum reserved quantity at any point in the interval?
    // Simplified conservative check: Sum of all overlapping reservations.
    // A better approach is to check day-by-day capacity if overlaps are partial,
    // but for now, if any overlap exists, we count it. 
    // Worst case validation: if many short rentals overlap, we might over-count usage, 
    // but under-counting is the risk to avoid.
    // Actually, simply summing overlaps is WRONG if they don't overlap EACH OTHER.
    // Correct algorithm:
    // 1. Get all events (start and end) in the range. 
    // 2. Sort by time. 
    // 3. Iterate and keep running count. Max count must be <= (Total - Requested).

    // Let's implement the robust sweeper.

    // 1. Get relevant reservations (overlapping the window)
    // We already have `overlappingReservations`.

    // 2. Create timeline events
    const events = [];
    overlappingReservations.forEach(r => {
        // We only care about the portion of the reservation within [startDate, endDate], 
        // but for capacity check, the reservation accounts for `r.quantity` usage during its full span.
        // We just need to check if usage exceeds capacity at any point in [startDate, endDate].

        let rStart = r.startDate < startDate ? startDate : r.startDate;
        let rEnd = r.endDate > endDate ? endDate : r.endDate;

        events.push({ time: rStart, type: 'start', qty: r.quantity });
        events.push({ time: rEnd, type: 'end', qty: r.quantity });
    });

    // Sort events
    events.sort((a, b) => {
        if (a.time < b.time) return -1;
        if (a.time > b.time) return 1;
        // if times equal, process 'end' before 'start' to free up capacity first (conservative? No, end frees up)
        // actually standard is end before start to allow back-to-back.
        if (a.type === 'end' && b.type === 'start') return -1;
        return 0;
    });

    let currentUsage = 0;
    let maxUsage = 0;

    for (const event of events) {
        if (event.type === 'start') {
            currentUsage += event.qty;
            if (currentUsage > maxUsage) maxUsage = currentUsage;
        } else {
            currentUsage -= event.qty;
        }
    }

    if (maxUsage + quantityParams > product.totalQuantity) {
        return false;
    }

    return true;
};

const createReservations = async (orderItems, orderId, session = null) => {
    const reservations = [];
    for (const item of orderItems) {
        const reservation = new Reservation({
            product: item.product,
            order: orderId,
            vendor: item.vendor,
            quantity: item.quantity,
            startDate: item.startDate,
            endDate: item.endDate,
            status: 'active'
        });
        if (session) {
            await reservation.save({ session });
        } else {
            await reservation.save();
        }
        reservations.push(reservation);
    }
    return reservations;
};

module.exports = {
    checkAvailability,
    createReservations,
};
