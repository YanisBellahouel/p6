const { model } = require("mongoose");
const sauces = require("../models/sauces");
const modelsSauces = require("../models/sauces");
const fs = require("fs");

exports.addSauce = (req, res, next) => {
  const SauceObject = JSON.parse(req.body.sauce);
  delete SauceObject._id;
  delete SauceObject._userId;

  const Sauce = new modelsSauces({
    ...SauceObject,
    userId: req.auth.userId,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  Sauce.save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getSauces = (req, res, next) => {
  modelsSauces
    .find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  modelsSauces
    .findOne({ _id: req.params.id })
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  modelsSauces
    .findOne({ _id: req.params.id })
    .then((sauceObject) => {
      // on vérifie si c'est le bon utilisateur
      if (sauceObject.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauceObject.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          modelsSauces
            .deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.modifySauce = (req, res, next) => {
  // on regarde si il y a deja une image
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  // on supprime _userId pour la sécuriter
  delete sauceObject._userId;
  modelsSauces
    .findOne({ _id: req.params.id })
    .then(() => {
      // on vérifie si c'est le bon utilisateur
      if (sauceObject.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        modelsSauces
          .updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.likeOrDislike = (req, res, next) => {
  // si je clique sur like alors +1 like

  if (req.body.like === 1) {
    modelsSauces
      .updateOne(
        { _id: req.params.id },
        {
          $inc: { likes: req.body.like++ },
          $push: { usersLiked: req.body.userId },
        }
      )
      .then(() => res.status(200).json({ message: "+1 like" }))
      .catch((error) => {
        res.status(400).json({ error });
      });

    // si je clique sur dislike alors +1 dislike
  } else if (req.body.like === -1) {
    modelsSauces
      .updateOne(
        { _id: req.params.id },
        {
          $inc: { dislikes: req.body.like++ * -1 },
          $push: { usersDisliked: req.body.userId },
        }
      )
      .then(() => res.status(200).json({ message: "+1 dislike" }))
      .catch((error) => {
        res.status(400).json({ error });
      });
  } else {
    // si je re clique sur like alors -1 like 
    modelsSauces.findOne({ _id: req.params.id }).then((sauces) => {
      if (sauces.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        modelsSauces
          .updateOne(
            { _id: req.params.id },
            { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
          )
          .then(() => {
            res.status(200).json({ message: "Votre avis a été supprimé" });
          })
          .catch((error) => {
            res.status(400).json({ error: error });
          });
          // si je re clique sur dislike alors -1 dislike 
      } else if (
        sauces.usersDisliked.includes(req.body.userId) &&
        req.body.like === 0
      ) {
        modelsSauces
          .updateOne(
            { _id: req.params.id },
            {
              $inc: { dislikes: -1 },
              $pull: { usersDisliked: req.body.userId },
            }
          )
          .then(() => {
            res.status(200).json({ message: "Votre avis a été supprimé" });
          })
          .catch((error) => {
            res.status(400).json({ error: error });
          });
      }
    });
  }
};
