
export async function getMessages(req, res) {
  const messages = await Message.find({ task: req.params.taskId })
    .populate('sender', 'name');
  res.json(messages);
}

export async function sendMessage(req, res) {
  const message = await Message.create({
    text: req.body.text,
    sender: req.user._id,
    task: req.params.taskId
  });
  res.status(201).json(message);
}