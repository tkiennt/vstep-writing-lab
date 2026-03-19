using System.Collections.Generic;
using System.Threading.Tasks;
using VstepWritingLab.Business.Interfaces;
using VstepWritingLab.Shared.Models.Entities;
using VstepWritingLab.Shared.Exceptions; // For NotFoundException

namespace VstepWritingLab.Business.Services
{
    public class RubricService
    {
        private readonly IRubricRepository _IRubricRepository;

        public RubricService(IRubricRepository IRubricRepository)
        {
            _IRubricRepository = IRubricRepository;
        }

        public async Task<List<RubricModel>> GetAllAsync()
        {
            return await _IRubricRepository.GetAllAsync();
        }

        public async Task<RubricModel> GetByIdAsync(string rubricId)
        {
            var rubric = await _IRubricRepository.GetByIdAsync(rubricId);
            if (rubric == null)
            {
                throw new NotFoundException($"Rubric {rubricId} not found");
            }
            return rubric;
        }
    }
}
