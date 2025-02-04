import Producto from '../models/Producto.js';
import fs from 'fs-extra';
import {
    uploadImage,
    deleteImage
} from '../helper/cloudinary.js';


const prueba = (req, res) => {
    res.send({
        msg: "En esta ruta gestionaremos todas las peticiones correspondiente al modelo de Producto"
    })
};

const createProductos = async (req, res) => {
    try {
        const { nombre, description, precio, stock } = req.body;
        let image;
        if (req.files !== null) {
            if (req.files.image) {

                const result = await uploadImage(req.files.image.tempFilePath);

                await fs.remove(req.files.image.tempFilePath);

                image = {
                    url: result.secure_url,
                    public_id: result.public_id,
                };

                console.log(result);
            }
        }

        const Newproducto = new Producto({ nombre, description, precio, image, stock });

        await Newproducto.save();

        return res.json(Newproducto);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: error.message });
    }
};

const getProductos = async (req, res) => {

    try {
        const productos = await Producto.find();

        res.send(productos);
    } catch (error) {

        console.log(error.message);
        return res.status(500).json({ message: error.message });
    }

};

const getProducto = async (req, res) => {

    try {
        const OneProduct = await Producto.findById(req.params.id);

        if (!OneProduct) {
            return res.status(404).json({
                msg: "No se encontro el producto"
            });
        } else {
            return res.json(OneProduct);
        }
    } catch (error) {
        return res.status(500).json({ msg: "No se encontro el producto" });
    }

};

const deleteProductos = async (req, res) => {
    try {
        
        const productRemoved = await Producto.findByIdAndDelete(req.params.id); 
        
        if (!productRemoved) {
            //const error = new Error("Token no valido");
            return res.sendStatus(404);
        } else {
            if (productRemoved.image.public_id) {
                await deleteImage(productRemoved.image.public_id);
            }
            return res.status(200).json({
                msg: "Producto Eliminado exitosamente"
            });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateProductos = async (req, res) => {

    const { id } = req.params;
    const { nombre, description, precio, stock } = req.body;
    //console.log(id, nombre, description, precio, stock);
    //console.log(req.files.image);
    try {
        const updateProducto = await Producto.findById(id);

        updateProducto.nombre = nombre;
        updateProducto.description = description;
        updateProducto.precio = precio;
        updateProducto.stock = stock;

        if (req.files !== null) {
            if (req.files.image) {
                await deleteImage(updateProducto.image.public_id);
                const result = await uploadImage(req.files.image.tempFilePath); await fs.remove(req.files.image.tempFilePath);
                updateProducto.image = {
                    url: result.secure_url,
                    public_id: result.public_id,
                };
            }
        }
        await updateProducto.save();
        console.log(updateProducto);

        return res.status(200).json(updateProducto);

    } catch (error) {
        console.log(error.message);
    }

};

export {
    prueba,
    deleteProductos,
    getProducto,
    getProductos,
    createProductos,
    updateProductos
};