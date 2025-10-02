using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using InnoviaHub.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using InnoviaHub.DTOs;

namespace Backend.Services
{
    public class OpenAiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public OpenAiService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        public async Task<string> GetChatResponse(string prompt)
        {
            var request = new
            {
                model = "gpt-4",
                messages = new[] {
                    new {role = "user", content = prompt}
                }
            };

            var requestContent = new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _config["OpenAI:Apikey"]);

            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", requestContent);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            dynamic result = JsonConvert.DeserializeObject(json);

            return result.choices[0].message.content.ToString();
        }

        public string BuildPrompt(string userInput, List<Timeslot> availableTimes)
        {
            var times = string.Join("\n", availableTimes.Select(t =>
                $"- {t.StartTime:yyyy-MM-dd HH:mm} till {t.EndTime:HH:mm}"));

            return $@"
            Du är en AI-assistent som hjälper användare att boka mötesrum.

            Tillgängliga tider:
            {times}

            Användarens meddelande:
            ""{userInput}""

            Tolka:
            - Datum och tider
            - Bekräfta förslag (t.ex. ""Vill du boka 09:00 till 14:00 den 3 oktober?"")
            - Returnera även json:
            {{""startTime"": ..., ""endTime"": ..., ""date"": ..., ""resourceType"": ""mötesrum""}}
            ";
        }
    }
}
