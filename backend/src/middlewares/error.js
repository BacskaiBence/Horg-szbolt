export function error(err,req,res,next){
    if (err.message.includes("Invalid")) {
        res.status(400).json({error: err.message})
    }
    if (err.message.includes("Failed")) {
        res.status(404).json({error: err.message})
    }
    if (err.message.includes("exists")) {
        res.status(409).json({error: err.message})
    }

    res.status(500).json({"Belső szerverhiba." : err.message });
}