namespace VSTEPWritingAI.Models.DTOs.Responses
{
    public class TaskResponse
    {
        public string TaskId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int Duration { get; set; }
        public int MinWords { get; set; }
        public double ScoreWeight { get; set; }
        public string Description { get; set; }
    }
}
