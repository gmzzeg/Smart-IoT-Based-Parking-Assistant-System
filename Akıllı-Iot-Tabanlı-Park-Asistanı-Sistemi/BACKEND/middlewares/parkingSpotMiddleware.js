import ParkingSpot from '../models/parkingSpot.js';


export const parkingSpotMiddleware = async (req, res, next) => {
    const { name, barrierId } = req.body;
  
    if (!name) {
      return res.status(400).json({ success: false, message: "Park yeri ismi (name) zorunludur." });
    }
    if (!barrierId) {
      return res.status(400).json({ success: false, message: "Bariyer ID (barrierId) zorunludur." });
    }
  
    const existingSpot = await ParkingSpot.findOne({ where: { name } });
    if (existingSpot) {
      return res.status(400).json({ success: false, message: "Bu park yeri ismi zaten kullanılıyor." });
    }
  
    next();
  };