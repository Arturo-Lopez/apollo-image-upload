import { ApolloServer, gql } from "apollo-server";
import fs from "fs";
import { v4 as uuid } from "uuid";

const typeDefs = gql`
  type Mutation {
    addFile(file: Upload!): String
  }

  type Query {
    files: [String]
  }
`;

const getFileNameList = () =>
  new Promise((res) => {
    fs.readdir("./images", (_, files) => {
      res(files);
    });
  });

const storeUpload = (file, filename) => {
  return new Promise((res, rej) => {
    let fileExtension = ".";
    const base64Data = file.replace(/^data:([A-Za-z-+/]+);base64,/, "");

    switch (base64Data.charAt(0)) {
      case "/":
        fileExtension += "jpg";
        break;
      case "i":
        fileExtension += "png";
        break;
      case "R":
        fileExtension += "gif";
        break;
      case "U":
        fileExtension += "webp";
        break;
      case "P":
        fileExtension += "svg";
      default:
        break;
    }

    const fullFilename = filename + fileExtension;

    fs.writeFile(`./images/${fullFilename}`, base64Data, "base64", (err) => {
      rej(err);
    });
    res();
  });
};

const resolvers = {
  Query: {
    files: async () => {
      const fileNames = await getFileNameList();
      return fileNames;
    },
  },
  Mutation: {
    addFile: async (_, args) => {
      try {
        const { file } = await args;

        await storeUpload(file, uuid());
        return "archivo subido";
      } catch (err) {
        return err;
      }
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
