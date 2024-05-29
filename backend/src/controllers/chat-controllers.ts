import { NextFunction, Request, Response } from "express";
import User from "../models/User.js";
import { configureOpenAI } from "../config/openai-config.js";
import { ChatCompletionRequestMessage, OpenAIApi } from "openai";

const retryRequest = async (
  func: () => Promise<any>,
  retries: number = 3,
  delay: number = 1000
): Promise<any> => {
  try {
    return await func();
  } catch (error) {
    if (retries <= 0 || error.response?.status !== 429) {
      throw error;
    }
    await new Promise((res) => setTimeout(res, delay));
    return retryRequest(func, retries - 1, delay * 2);
  }
};

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message } = req.body;
  try {
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });
    }

    // Memorize chats of User
    const chats = user.chats.map(({ role, content }) => ({
      role,
      content,
    })) as ChatCompletionRequestMessage[];
    chats.push({ content: message, role: "user" });
    user.chats.push({ content: message, role: "user" });

    // Send all chats with the new one to OpenAI API
    const config = configureOpenAI();
    const openai = new OpenAIApi(config);

    const chatResponse = await retryRequest(() =>
      openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: chats,
      })
    );

    if (chatResponse.data.choices && chatResponse.data.choices.length > 0) {
      user.chats.push(chatResponse.data.choices[0].message);
      await user.save();
      return res.status(200).json({ chats: user.chats });
    } else {
      console.error("No choices returned from OpenAI API");
      return res
        .status(500)
        .json({ message: "Failed to get a response from OpenAI" });
    }
  } catch (error) {
    console.error("Error in generateChatCompletion:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

export const sendChatsToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res.status(200).json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    //@ts-ignore
    user.chats = [];
    await user.save();
    return res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
