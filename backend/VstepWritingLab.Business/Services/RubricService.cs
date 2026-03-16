using System.Collections.Generic;
using System.Threading.Tasks;
using VstepWritingLab.Data.Repositories;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Shared.Exceptions; // For NotFoundException

namespace VstepWritingLab.Business.Services
{
    public class RubricService
    {
        private readonly RubricRepository _rubricRepository;

        public RubricService(RubricRepository rubricRepository)
        {
            _rubricRepository = rubricRepository;
        }

        public async Task<List<RubricModel>> GetAllAsync()
        {
            return await _rubricRepository.GetAllAsync();
        }

        public async Task<RubricModel> GetByIdAsync(string rubricId)
        {
            var rubric = await _rubricRepository.GetByIdAsync(rubricId);
            if (rubric == null)
            {
                throw new NotFoundException($"Rubric {rubricId} not found");
            }
            return rubric;
        }
    }
}
