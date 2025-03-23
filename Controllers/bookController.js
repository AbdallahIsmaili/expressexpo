const Book=require("../Models/book");
const mongoose=require("mongoose");

const createBook= async (req,res) => {
    
    try{   
    
    const {id ,title, author,year,genre,description}=req.body;

     if (!title || !author || !year || !genre) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
      }

      const newBook= new Book({
        id,
        title,
        author,
        year,
        genre,
        description
      });
      await newBook.save();
      res.status(200).json({"message":"le livre est ajouté"});
    } catch (error) {
        res.status(500).json({message :error.message});
    }
}

const updateBook= async (req,res) =>{
    try{
        const {id}=req.params;
       
        const {title,author,year,genre,description}=req.body;
        const book= await Book.findOne({ id: parseInt(id) });
        if(!book){
            return res.status(404).json({message: "le livre n'existe pas"});
        }

        book.title=title || book.title;
        book.author = author || book.author;
        book.year = year || book.year;
        book.genre = genre || book.genre;
        book.description = description || book.description;
        await book.save();
        res.status(200).json({message:"le livre est modifie"});

    }catch(error){
        res.status(500).json({message:error.message});
    }
}
module.exports={createBook,updateBook};