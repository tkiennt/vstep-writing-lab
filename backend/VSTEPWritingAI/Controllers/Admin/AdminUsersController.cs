using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using VSTEPWritingAI.Models.DTOs.Requests;
using VSTEPWritingAI.Services;

namespace VSTEPWritingAI.Controllers.Admin
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Policy = "AdminOnly")]
    public class AdminUsersController : ControllerBase
    {
        private readonly AdminUserService _adminUserService;

        public AdminUsersController(AdminUserService adminUserService)
        {
            _adminUserService = adminUserService;
        }

        // GET /api/admin/users
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _adminUserService.GetAllUsersAsync();
            return Ok(users);
        }

        // GET /api/admin/users/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _adminUserService.GetUserByIdAsync(id);
            return Ok(user);
        }

        // PATCH /api/admin/users/{id}
        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(
            string id,
            [FromBody] UpdateUserRequest request)
        {
            var updated = await _adminUserService.UpdateUserAsync(id, request);
            return Ok(updated);
        }

        // DELETE /api/admin/users/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _adminUserService.DeleteUserAsync(id);
            return NoContent();
        }
    }
}
