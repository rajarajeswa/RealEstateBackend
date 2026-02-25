const { Address } = require('../model/Address');

/**
 * Get all addresses for the logged-in user
 * GET /api/addresses
 */
const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.findAll({
            where: { userId },
            order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
        });
        res.json({ success: true, addresses });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
    }
};

/**
 * Get a single address by ID
 * GET /api/addresses/:id
 */
const getAddressById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const address = await Address.findOne({
            where: { id, userId }
        });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        res.json({ success: true, address });
    } catch (error) {
        console.error('Error fetching address:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch address' });
    }
};

/**
 * Create a new address
 * POST /api/addresses
 */
const createAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { label, name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

        // Validation
        if (!name || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: 'Name, address, city, state, and pincode are required'
            });
        }

        // Pincode validation (6 digits for India)
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pincode. Must be 6 digits'
            });
        }

        // Phone validation (optional but if provided, must be 10 digits)
        if (phone && !/^[6-9][0-9]{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number. Must be 10 digits starting with 6-9'
            });
        }

        // If this is set as default, remove default from other addresses
        if (isDefault) {
            await Address.update(
                { isDefault: false },
                { where: { userId } }
            );
        }

        const address = await Address.create({
            userId,
            label: label || 'Home',
            name,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            isDefault: isDefault || false
        });

        res.status(201).json({ success: true, message: 'Address saved successfully', address });
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ success: false, message: 'Failed to save address' });
    }
};

/**
 * Update an existing address
 * PUT /api/addresses/:id
 */
const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { label, name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

        // Check if address belongs to user
        const address = await Address.findOne({ where: { id, userId } });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Pincode validation if provided
        if (pincode && !/^[1-9][0-9]{5}$/.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pincode. Must be 6 digits'
            });
        }

        // Phone validation if provided
        if (phone && !/^[6-9][0-9]{9}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number. Must be 10 digits starting with 6-9'
            });
        }

        // If this is set as default, remove default from other addresses
        if (isDefault) {
            await Address.update(
                { isDefault: false },
                { where: { userId } }
            );
        }

        await address.update({
            label: label || address.label,
            name: name || address.name,
            phone: phone !== undefined ? phone : address.phone,
            addressLine1: addressLine1 || address.addressLine1,
            addressLine2: addressLine2 !== undefined ? addressLine2 : address.addressLine2,
            city: city || address.city,
            state: state || address.state,
            pincode: pincode || address.pincode,
            isDefault: isDefault !== undefined ? isDefault : address.isDefault
        });

        res.json({ success: true, message: 'Address updated successfully', address });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ success: false, message: 'Failed to update address' });
    }
};

/**
 * Delete an address
 * DELETE /api/addresses/:id
 */
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const address = await Address.findOne({ where: { id, userId } });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await address.destroy();
        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ success: false, message: 'Failed to delete address' });
    }
};

/**
 * Set an address as default
 * PUT /api/addresses/:id/default
 */
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const address = await Address.findOne({ where: { id, userId } });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Remove default from all other addresses
        await Address.update(
            { isDefault: false },
            { where: { userId } }
        );

        // Set this address as default
        await address.update({ isDefault: true });

        res.json({ success: true, message: 'Default address updated' });
    } catch (error) {
        console.error('Error setting default address:', error);
        res.status(500).json({ success: false, message: 'Failed to set default address' });
    }
};

module.exports = {
    getAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
