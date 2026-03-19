using System.Collections.Generic;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.Firestore;
using VSTEPWritingAI.Repositories;
using VSTEPWritingAI.Exceptions;

namespace VSTEPWritingAI.Services
{
    public class RubricService
    {
        private readonly RubricRepository _rubricRepo;

        public RubricService(RubricRepository rubricRepo)
        {
            _rubricRepo = rubricRepo;
        }

        public async Task<List<RubricModel>> GetAllAsync()
        {
            return await _rubricRepo.GetAllAsync();
        }

        public async Task<RubricModel> GetByIdAsync(string rubricId)
        {
            var rubric = await _rubricRepo.GetByIdAsync(rubricId);
            if (rubric == null)
                throw new NotFoundException($"Rubric {rubricId} not found");

            return rubric;
        }
    }
}
